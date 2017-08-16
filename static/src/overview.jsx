'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import InfoSquare       from    './components/infoSquare';
import BRackOverview    from    './components/rackOverviewBox';
import BNodeOverview    from    './components/nodeOverviewBox';
import Chords           from    './visualization/chordWheel'


//P for Page.. -> PageOverview
class POverview extends Skeleton{

    constructor(props) {
        super(props);
    }//ctor


    render() {
        var panelClass = "col-md-2";
        var rackOverviewHeight  = this.getHeightRatio(0.3);
        var nodeInfoHeight      = this.getHeightRatio(0.64);

        var middleWidth     = window.innerWidth - (this.state.panelWidth * 2);
        var middleHeight    = this.getHeight(105, 1);

        return (
            <Skeleton>
                <div className={panelClass}
                        style={{
                                minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth }}>

                    <InfoSquare height={rackOverviewHeight}>
                        <BRackOverview/>
                    </InfoSquare>

                    <InfoSquare height={nodeInfoHeight}>
                        <BNodeOverview/>
                    </InfoSquare>
                </div>
            </Skeleton>
        );//return

    }//render

}//class


export default POverview;
