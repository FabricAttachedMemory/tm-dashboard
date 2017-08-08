'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import InfoSquare       from    './components/infoSquare';
import Chords from './visualization/chordWheel'


//P for Page.. -> PageOverview
class PMemoryManagement extends Skeleton{

    constructor(props) {
        super(props);
    }//ctor


    render() {
        var panelClass = "col-md-2";
        var pannelHeight = this.getHeight(65, 2) + "px";

        var middleWidth = window.innerWidth - (this.state.panelWidth * 2);
        var middleHeight = this.getHeight(105, 1) + "px";

        return (
            <Skeleton>
                <div className="col-md-8"
                    style={{width: middleWidth}}>
                    <Middle activeKey={1} height={middleHeight}>
                        Memory Management
                    </Middle>
                </div>

                <div className={panelClass}
                        style={{
                                minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth }}>
                    <InfoSquare number='Box 1'
                                height={pannelHeight}/>
                    <InfoSquare number="Box 2"
                                height={pannelHeight}/>
                </div>


            </Skeleton>
        );

    }//render

}//class


export default PMemoryManagement;
