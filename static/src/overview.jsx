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


    mmDsc(name){
        var st = {
            padding: "0px",
            margin: "0px"
        };
        return(
        <div className="col-md-5" style={{padding:"0px"}}>
            <div className="col-md-2">
                <div className="gridBox"></div>
            </div>
            <div className="col-md-10">
                {name}
            </div>
        </div>
        );
    }


    render() {
        var panelClass = "col-md-2";
        var nodeDscHeight = (window.innerHeight * 0.3) + "px";
        var panelHeight = (window.innerHeight * 0.3) + "px";
        var percentCircleHeight = (window.innerHeight * 0.3) + "px";
        panelHeight = this.getHeight(55, 3) + "px";

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

                    <InfoSquare override height={panelHeight}>
                        <div className="data-display">
                            14
                        </div>
                        <div className="data-container-name">
                            TB
                        </div>
                        <div className="row" style={{margin:"0px", padding: "0px", height:"20px"}}>
                            {this.mmDsc("Allocated")}
                            {this.mmDsc("Available")}
                        </div>
                        <div className="row" style={{margin:"0px", padding: "0px", height:"20px"}}>
                            {this.mmDsc("Not Ready")}
                            {this.mmDsc("Offline")}
                        </div>
                    </InfoSquare>

                    <InfoSquare number='14'
                                desc="ACTIVE SHELVES"
                                height={panelHeight}/>
                    <InfoSquare number="1,792"
                                desc="BOOKS"
                                height={panelHeight}/>
                </div>
            </Skeleton>
        );

    }//render

}//class


export default POverview;
