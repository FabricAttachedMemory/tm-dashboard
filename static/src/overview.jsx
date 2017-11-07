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
import ChordShowcase    from    './visualization/chordShowcase';


//P for Page.. -> PageOverview
class POverview extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            panelMaxWidth : "300px",
            panelMinWidth : "250px",
            forceRender : false,
        };
        this.state.heightStack = [];
        this.state.intervalId = -1;
        this.state.nodeInfoHeight = "772px";
    }//ctor


    buildRackOverview(){
        return(
            <BRackOverview name="Enclosure 1" enc={1} nodeCount={7}/>
        );
    }//buildRackOverview

    componentWillMount(){
        //window.addEventListener("resize", this.updateDimensions.bind(this));

        this.state.intervalId = setInterval(() => {
            var isHeightChange = this.calculateHeights();
            var heightDiff = this.adjustHeight(this.state.heightStack);
            var currHeight = parseFloat(this.state.nodeInfoHeight.split("px")[0]);
            if(currHeight != heightDiff){
                this.setState( { nodeInfoHeight : heightDiff + "px" });
            }

            if(isHeightChange)
                this.setState( { forceRender : true } );
            else
                this.state.forceRender = false;
        }, 1000);

    }//componentWillMount


    componentWillUnmount(){
        if(this.state.intervalId != -1){
            clearInterval(this.state.intervalId);
        }
    }//componentWillUnmount

    shouldComponentUpdate(nextProps, nextState){
        return true;
    }

    adjustHeight(heightStack){
        var total = 0;
        for(var i = 0; i < heightStack.length; i++){
            total += heightStack[i];
        }//for
        var diff = window.innerHeight - total;
        return diff;
    }


    calculateHeights(){
        var heightStack = [];
        var headerBox = document.getElementById("headerPanel");
        var marginBottom = 0;
        if(headerBox != null){
            marginBottom = parseFloat(window.getComputedStyle(headerBox).marginBottom.split("px")[0]);
            heightStack.push(parseFloat(headerBox.clientHeight) + marginBottom);
        }

        var rackBox = document.getElementById("RackOverviewBox");
        if(rackBox != null){
            marginBottom = parseFloat(window.getComputedStyle(rackBox)
                                                .marginBottom.split("px")[0]);
            heightStack.push(parseFloat(rackBox.clientHeight) + marginBottom * 3);
        }

        var demoBox = document.getElementById("DemoControlsBox");
        if(demoBox != null){
            marginBottom = parseFloat(window.getComputedStyle(demoBox)
                                                .marginBottom.split("px")[0]);
            heightStack.push(parseFloat(demoBox.clientHeight) + marginBottom * 3);
        }

        this.state.heightStack = heightStack;
        if(heightStack.length == 2){
            if(heightStack.toString() !== this.state.heightStack.toString()){
                //this.setState ( { heightStack : heightStack, forceRender : true });
                return true;
            }else{
                //this.setState( { forceRender : false } );
                return false;
            }
        }
    }//componentDidMount


    buildNodeStats(state){
        //make stats smoothly appear on the screen when ready to render data.
        //otherwise - set oppacity to 0 to hide all stats data.
        var className = (state) ? "smoothFadein" : "smoothFadeout";
        return (
            <div>
            <BoxHeader text="Node No. (Enclosure No.)"
                        id="Nodebox_title"
                        className={className}
                        textAlign="left"
                        paddingLeft="20px"/>
            <NodeStats name="RightBoxEnclosureNo"
                        url="http://localhost:9099/api/pernode"
                        className={className}
                        spoofedData={DataSpoofer.nodeStatsData()}/>
            </div>
        );
    }

    render() {
        var panelClass = "col-md-2";

        var nodeInfoHeight  = this.state.nodeInfoHeight;
        //var dscBtnBox       = this.getHeightRatio(0.08);
        var dscBtnBox = "200px";

        var nodeInfoPaddingTop  = (nodeInfoHeight.split("px")[0] / 5) + "px";

        return (
            <Skeleton id={this.props.id}>
                <div className={panelClass}
                        style={{
                                minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth
                                }}>

                    <ContentBox name="CB_RackOverview"
                                id="RackOverviewBox" desc="Rack Overview"
                                height={"auto"}>
                        <BoxHeader text="Rack Overview"
                                    textAlign="left"
                                    paddingLeft="20px"/>
                        <BRackOverview name="Enclosure 1" enc={1}
                                        url="http://localhost:9099/api/nodes"
                                        nodeCount={7}/>
                    </ContentBox>

                    <ContentBox name="CB_NodeStats"
                                id="NodeStatsBox"
                                paddingTop={nodeInfoPaddingTop}
                                height={nodeInfoHeight}
                                maxHeight={nodeInfoHeight}>
                        {this.buildNodeStats(nodeInfoHeight != "0px")}
                    </ContentBox>

                    <ContentBox id="DemoControlsBox"
                                name="CB_DemoContolBox"
                                height={dscBtnBox}>
                        <ChordShowcase/>
                    </ContentBox>
                </div>
            </Skeleton>
        );//return

    }//render

}//class

POverview.defaultProps = {
    id : "POverview"
}

export default POverview;
