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
        };
        this.state.heightStack = [];
        this.state.intervalId = -1;
    }//ctor


    buildRackOverview(){
        return(
            <BRackOverview name="Enclosure 1" enc={1} nodeCount={7}/>
        );
    }//buildRackOverview

    componentWillMount(){
        //window.addEventListener("resize", this.updateDimensions.bind(this));

        this.state.intervalId = setInterval(() => {
            this.calculateHeights();
        }, 1000);

    }//componentWillMount


    componentWillUnmount(){
        if(this.state.intervalId != -1){
            clearInterval(this.state.intervalId);
        }
    }//componentWillUnmount

/*
    shouldComponentUpdate(nextProps, nextState){
        return true;
    }
*/


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

        if(heightStack.length == 2){
            if(heightStack.toString() !== this.state.heightStack.toString()){
                this.setState ( { heightStack : heightStack });
                //this.setState( { forceRender : true } );
            }else{
                //this.setState( { forceRender : false } );

            }
        }
        this.state.heightStack = heightStack;
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

        var nodeInfoHeight  = "0px";
        //var dscBtnBox       = this.getHeightRatio(0.08);
        var dscBtnBox = "200px";

        if(this.state.heightStack.length == 2){
            nodeInfoHeight = window.innerHeight;
            nodeInfoHeight -= this.state.heightStack[0];
            nodeInfoHeight -= this.state.heightStack[1];
            nodeInfoHeight -= parseFloat(dscBtnBox.split("px")[0]);
            nodeInfoHeight -= 2;
            nodeInfoHeight += "px";
        }else{
            nodeInfoHeight = "500px";
        }

        var nodeInfoPaddingTop  = (nodeInfoHeight.split("px")[0] / 5) + "px";

        return (
            <Skeleton id={this.props.id}>
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
