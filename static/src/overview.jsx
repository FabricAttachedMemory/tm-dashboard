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
    }//ctor


    buildRackOverview(){
        return(
            <BRackOverview name="Enclosure 1" enc={1} nodeCount={7}/>
        );
    }//buildRackOverview


    componentDidMount(){
        var box = document.getElementById("RackOverviewBox");
        var boxHeight = box.offsetHeight;
        var statsBox = document.getElementById("NodeStatsBox");
        var statsBoxHeight = statsBox.offestHeight;
    }//componentDidMount


    render() {
        var panelClass = "col-md-2";
        var encCount = parseInt(DataSharing.Get("Enclosures"));
        var rackOverviewHeight  = this.getHeightRatio(0.3);
        var heightTaken = 0.12 * encCount;

        var elm = document.getElementById("RackOverviewBox");
        if(elm != null)
            heightTaken = elm.clientHeight;
        else
            heightTaken = 351;

        elm = document.getElementById("headerPanel");
        if(elm != null)
            heightTaken += elm.clientHeight;
        else
            heightTaken += 40;

        if(!isNaN(encCount))
            rackOverviewHeight  = this.getHeightRatio(heightTaken);

        heightTaken += 135;
        //heightTaken = 0.93 - heightTaken - 0.092;
//        var nodeInfoHeight  = this.getHeightRatio(heightTaken);
        var nodeInfoHeight  = window.innerHeight - heightTaken + "px";
        var dscBtnBox       = this.getHeightRatio(0.092);

        //maxHeight = height so that paddingTop does not extend height further.
        var nodeInfoMaxHeight   = nodeInfoHeight;
        var nodeInfoPaddingTop  = (nodeInfoHeight.split("px")[0] / 5) + "px";

        var middleWidth     = window.innerWidth - (this.state.panelWidth * 2);
        var middleHeight    = this.getHeight(105, 1);

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
                                        nodeCount={7}/>
                    </ContentBox>

                    <ContentBox id="NodeStatsBox" paddingTop={nodeInfoPaddingTop}
                                    height={nodeInfoHeight}
                                    maxHeight={nodeInfoMaxHeight}>
                        <BoxHeader text="Node No. (Enclosure No.)"
                                    textAlign="left"
                                    paddingLeft="20px"/>
                        <NodeStats name="RightBoxEnclosureNo"
                                   spoofedData={DataSpoofer.nodeStatsData()}/>
                    </ContentBox>

                    <ContentBox height={dscBtnBox}>
                    </ContentBox>
                </div>
            </Skeleton>
        );//return

    }//render

}//class


export default POverview;
