'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import ContentBox       from    './components/contentBox';
import BRackOverview    from    './components/rackOverviewBox';
import BoxHeader        from    './components/infoBoxHeader';
import NodeStats        from    './components/nodeStats';
import * as DataSpoofer from    './components/spoofer';


//P for Page.. -> PageOverview
class POverview extends Skeleton{

    constructor(props) {
        super(props);
    }//ctor


    render() {
        var panelClass = "col-md-2";
        var rackOverviewHeight  = this.getHeightRatio(0.3);
        var nodeInfoHeight      = this.getHeightRatio(0.508);
        var dscBtnBox           = this.getHeightRatio(0.123);
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

                    <ContentBox id="RackOverviewBox" desc="Rack Overview">
                        <BoxHeader text="Rack Overview"
                                    textAlign="left"
                                    paddingLeft="20px"/>
                        <BRackOverview name="Enclosure 1"/>
                        <BRackOverview name="Enclosure 2"/>
                    </ContentBox>

                    <ContentBox paddingTop={nodeInfoPaddingTop} height={nodeInfoHeight} maxHeight={nodeInfoMaxHeight}>
                        <BoxHeader text="Node No. (Enclosure No.)"
                                    textAlign="left"
                                    paddingLeft="20px"/>
                        <NodeStats spoofedData={DataSpoofer.nodeStatsData()}/>
                    </ContentBox>

                    <ContentBox height={dscBtnBox}>
                    </ContentBox>
                </div>
            </Skeleton>
        );//return

    }//render

}//class


export default POverview;
