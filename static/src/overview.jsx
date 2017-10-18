'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import ContentBox       from    './components/contentBox';
import BoxHeader        from    './components/infoBoxHeader';
import NodeStats        from    './components/nodeStats';
import * as DataSpoofer from    './components/spoofer';
import * as DataSharing from    './components/dataSharing';
import BRackOverview    from    './visualization/rackOverviewBox';


//P for Page.. -> PageOverview
class POverview extends Skeleton{

    constructor(props) {
        super(props);
        this.state.isFirstRender = true;
        this.state.heightStack = [];
    }//ctor


    buildRackOverview(){
        return(
            <BRackOverview name="Enclosure 1" enc={1} nodeCount={7}/>
        );
    }//buildRackOverview

    componentWillMount(){
        window.addEventListener("resize", this.updateDimensions.bind(this));

        setInterval(() => {
            this.setState({isForceRender : true });
            this.calculateHeights();
        }, 1000);

    }//componentWillMount

    calculateHeights(){
        this.state.heightStack = [];
        var headerBox = document.getElementById("headerPanel");
        var marginBottom = 0;
        if(headerBox != null){
            marginBottom = parseFloat(window.getComputedStyle(headerBox).marginBottom.split("px")[0]);
            this.state.heightStack.push(parseFloat(headerBox.clientHeight) + marginBottom);
        }

        var rackBox = document.getElementById("RackOverviewBox");
        if(rackBox != null){
            marginBottom = parseFloat(window.getComputedStyle(rackBox).marginBottom.split("px")[0]);
            console.log(marginBottom);
            this.state.heightStack.push(parseFloat(rackBox.clientHeight) + marginBottom * 3);
        }
        if(this.state.heightStack.length == 2){
            this.setState({forceRender : true});
        }
    }//componentDidMount




    buildNodeStats(state){
        //make stats smoothly appear on the screen when ready to render data.
        //otherwise - set oppacity to 0 to hide all stats data.
        var className = (state) ? "smoothFadein" : "smoothFadeout";
        return (
            <div>
            <BoxHeader text="Node No. (Enclosure No.)"
                        className={className}
                        textAlign="left"
                        paddingLeft="20px"/>
            <NodeStats name="RightBoxEnclosureNo"
                        className={className}
                        spoofedData={DataSpoofer.nodeStatsData()}/>
            </div>
        );
    }

    render() {
        var panelClass = "col-md-2";
        // var encCount = parseInt(DataSharing.Get("Enclosures"));
        // var rackOverviewHeight  = this.getHeightRatio(0.3);
        // var heightTaken = 0.125 * encCount;

        // if(!isNaN(encCount))
            // rackOverviewHeight  = this.getHeightRatio(heightTaken);

        // heightTaken += 135;
        // var nodeInfoHeight  = window.innerHeight - heightTaken + "px";
        var nodeInfoHeight  = "0px";
        var dscBtnBox       = this.getHeightRatio(0.08);

        if(this.state.heightStack.length == 2){
            nodeInfoHeight = window.innerHeight;
            nodeInfoHeight -= this.state.heightStack[0];
            nodeInfoHeight -= this.state.heightStack[1];
            nodeInfoHeight -= parseFloat(dscBtnBox.split("px")[0]);
            // nodeInfoHeight -= 20;
            nodeInfoHeight += "px";
        }

        var nodeInfoPaddingTop  = (nodeInfoHeight.split("px")[0] / 5) + "px";
        return (
            <Skeleton>
                <div className={panelClass}
                        style={{
                                minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth }}>

                    <ContentBox id="RackOverviewBox" desc="Rack Overview"
                                height={"auto"}>
                        <BoxHeader text="Rack Overview"
                                    textAlign="left"
                                    paddingLeft="20px"/>
                        <BRackOverview name="Enclosure 1" enc={1}
                                        url="http://localhost:9099/api/nodes"
                                        nodeCount={7}/>
                    </ContentBox>

                    <ContentBox id="NodeStatsBox"
                                paddingTop={nodeInfoPaddingTop}
                                height={nodeInfoHeight}
                                maxHeight={nodeInfoHeight}>
                        {this.buildNodeStats(nodeInfoHeight != "0px")}
                    </ContentBox>

                    <ContentBox height={dscBtnBox}>
                    </ContentBox>
                </div>
            </Skeleton>
        );//return

    }//render

}//class


export default POverview;
