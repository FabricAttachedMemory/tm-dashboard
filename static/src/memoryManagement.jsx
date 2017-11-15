'use strict';

import React from 'react';
import {render} from 'react-dom';

import Skeleton         from    './skeleton';
import Middle           from    './components/middle';
import ContentBox       from    './components/contentBox';
import MMDataBox        from    './components/mmDataBox';
import PercentCircle    from    './components/percentcircle';


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
        var memPanelHeight = panelHeight;

        //var panelHeight = this.getHeightRatio(0.2);
        var memCircleHeight = parseFloat(panelHeight.split("px")[0]) * 0.4 + "px";
        //extract value from string of the form "8px".
        var boxMarginVal    = parseFloat(this.state.boxMargin.split("px")[0]);
        var middleWidth     = window.innerWidth - (this.state.panelWidth * 2) - boxMarginVal * 3;
        var middleHeight    = this.getHeight(105, 1);

        //Adjust margins for the smaller screen size.
        var memValPadT = "0.8em";
        var memValMarginB = "3.0em";

        if(window.innerHeight < 1000){
            memPanelHeight = this.getHeightRatio(0.35);
            panelHeight = this.getHeight(parseFloat(memPanelHeight.split("px")[0]) + 65, 2);
            memValPadT = "0.5em";
            memValMarginB = "0.0em";
        }

        return (
            <Skeleton id={this.props.id}>
                <div className={panelClass}
                        style={{minWidth: this.state.panelMinWidth,
                                maxWidth: this.state.panelMaxWidth}}>

                    <ContentBox name="CB_MemoryBreakdown" height={memPanelHeight}>
                        <div className="data-container-name"
                        style={{marginTop: "1.5em", marginBottom: "0px"}}>
                            Memory breakdown
                        </div>

                        <PercentCircle name="TOTAL"
                                        url="http://localhost:9099/api/memory/total"
                                        metricsType="auto"
                                        radiusRatio={1.1}
                                        boxHeight="auto"
                                        height={memCircleHeight}
                                        paddingTop="2em"
                                        valueStyle={{fontSize:"2.5em"}}
                            marginBottom="8em"
                            marginTop="0px"
                        />
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
                    </ContentBox>

                    <ContentBox  name="CB_ActiveShelves"
                                url="http://localhost:9099/api/memory/active_shelves"
                                number={0}
                                desc="SHELVES"
                                height={panelHeight}
                                fontSize={"4em"}
                                paddingTop={"0em"}
                    />
                    <ContentBox name="CB_ActiveBooks"
                                url="http://localhost:9099/api/memory/active_books"
                                number={0}
                                desc="BOOKS"
                                fontSize={"4em"}
                                paddingTop={"0em"}
                                height={panelHeight}/>
                </div>
            </Skeleton>
        );

    }//render

}//class


PMemoryManagement.defaultProps = {
    id : "PMemoryManagement"
}

export default PMemoryManagement;
