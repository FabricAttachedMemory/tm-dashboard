'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import InfoSquare       from    './components/infoSquare';


//P for Page.. -> PageOverview
class PMemoryManagement extends Skeleton{

    constructor(props) {
        super(props);
    }//ctor


    /* Return an element that displays description of the grids' boxes. */
    mmDsc(name, colorClass){
        var classNames = "gridBox " + colorClass;

        return(
            <div className="col-md-6" style={{padding:"0px"}}>
                <div className="col-md-2">
                    <div className={classNames}
                        style={{marginLeft: "1.5em", width:"20px"}}>
                    </div>
                </div>
                <div className="col-md-10" style={{color:"white",
                                                paddingLeft: "2.5em",
                                                whiteSpace: "nowrap"}}>
                    {name}
                </div>
            </div>
        );
    }//mmDsc


    underline(){
        /* Draw an underline/divider strip using <hr> tag and "underline" css
        class, that can be found in the stats.css stylesheet. */
        var hrStyle = {
            marginTop:"5px",
        };

        return(
            <div className="row" style={{padding:"0px",
                                        margin:"1% 0% 1% 0%",
                                        height:"15px"}}>
                <div className="col-md-6">
                    <hr className="underline" style={hrStyle}/>
                </div>
                <div className="col-md-6">
                    <hr  className="underline" style={hrStyle}/>
                </div>
            </div>
        );
    }//underline


    render() {
        var panelClass = "col-md-2";
        var panelHeight = this.getHeight(65, 3);

        //extract value from string of the form "8px".
        var boxMarginVal    = parseFloat(this.state.boxMargin.split("px")[0]);
        var middleWidth     = window.innerWidth - (this.state.panelWidth * 2) - boxMarginVal * 3;
        var middleHeight    = this.getHeight(105, 1);

        return (
            <Skeleton>
                <div className={panelClass}
                        style={{minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth}}>

                    <InfoSquare height={panelHeight}>
                        <div className="data-display" style={{paddingTop: "0.9em"}}>
                            14
                        </div>
                        <div className="data-container-name">
                            TB
                        </div>
                        <div className="row" style={{margin:"0px",
                                                    padding: "0px",
                                                    height:"20px",
                                                    marginTop: "20px"}}>
                            {this.mmDsc("Allocated", "boxAllocated")}
                            {this.mmDsc("Available", "boxAvailable")}
                        </div>

                            {this.underline()}

                        <div className="row" style={{margin:"0px",
                                                    padding: "0px",
                                                    height:"20px"}}>
                            {this.mmDsc("Not Ready", "boxNotReady")}
                            {this.mmDsc("Offline", "boxOffline")}
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


export default PMemoryManagement;
