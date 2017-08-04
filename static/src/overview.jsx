'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton     from    './skeleton';
import Middle       from    './components/middle';
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
        var middleWidth = this.getWidth(475, 1) + "px";
        var middleHeight = this.getHeight(105, 1) + "px";

        return (
            <Skeleton>
                <div className="col-md-8"
                    style={{width: middleWidth, margin:"0px", padding:"0px"}}>
                    <Middle activeKey={1} height={middleHeight}>
                        OVERVIEW TAB
                    </Middle>
                </div>

                <div className={panelClass} style={{ width: this.state.panelWidth }}>
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
