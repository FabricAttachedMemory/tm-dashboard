'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import InfoSquare       from    './components/infoSquare';
import Chords from './visualization/chordWheel'


//P for Page.. -> PageOverview
class POverview extends Skeleton{

    constructor(props) {
        super(props);
    }//ctor


    render() {
        var panelClass = "col-md-2";
        var pannelHeight = this.getHeight(65, 3) + "px";

        //extract value from string of the form "8px".
        var boxMarginVal = parseFloat(this.state.boxMargin.split("px")[0]);
        var middleWidth = window.innerWidth - (this.state.panelWidth * 2) - boxMarginVal * 3;
        var middleHeight = this.getHeight(105, 1) + "px";

        return (
            <Skeleton>
                <div className={panelClass}
                        style={{
                                minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth }}>
                    <InfoSquare number='14'
                                desc="ACTIVE SHELVES"
                                height={pannelHeight}/>
                    <InfoSquare number="1,792"
                                desc="BOOKS"
                                height={pannelHeight}/>
                </div>
            </Skeleton>
        );

    }//render

}//class


export default POverview;
