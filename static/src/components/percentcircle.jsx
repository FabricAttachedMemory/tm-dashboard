'use strict';
import React    from 'react';
import {render} from 'react-dom';

import StatsBox     from './wrappers/statsBox';
import BoxHeader    from './infoBoxHeader';
import ApiRequester from './base/apiRequester';


/* Using <svg> and <circle> html elements, create a "load circle" (with the
help of css/stats.css stylesheet) to show system load statuses, e.g cpu, fam...

This class inherits ApiRequester class that helps to abstract components data
fetching and box rendering (resizing, aligmnet...). With that, several default
props and stats are inherited as well. Therefore, DO NOT use PercentCircle.defaultProps
to set properties - or it will just override parent's props. As a work around,
you can add new state properties in the constructor with default values. Refere
to visualization/grids.jsx component for example. Usually, I try to avoid referring
this.props anywhere in the code outside of constructor... so this.state should be
fine.*/
class PercentCircle extends ApiRequester {

    constructor(props){
        super(props);
        //Replacing Spaces with underscore.
        var nameSplit       = this.props.name.split(" ");
        //This seems simpler than using Regex...
        var replacedSpaces  = nameSplit.join("_");

        //ID will be assigned to the div that wrapps <sv> element. I don't
        //remember what for...
        this.state.containerId = replacedSpaces + "_container";
    }//constructor


    render() {
        //this will set this.state.percent value (spoofed or real).
        var fetchedValue = this.readFetchedValues();

        //Radius of the circle that was set in css/stats.css.
        var radius = 100;

        //SVG's property strokeDasharray is calculated to render the "filling"
        //of a circle.
        var progress_fill = radius * 2 * Math.PI;
        //How much filling to do of the circle based of desired precentage.
        var percentVal = (fetchedValue < 0) ? 0 : fetchedValue;
        var circle_fill_offset = ((100 - percentVal) / 100) * progress_fill;

        var valueText = (fetchedValue < 0 || fetchedValue == "") ? "No Flow" : fetchedValue;
        var metricsSymbol = parseInt(valueText);
        metricsSymbol = (isNaN(metricsSymbol)) ? "" : "%";

        this.state.fetched = null; //Resetting fetched for the next circle\interval.
        var containerHeight = parseFloat(this.props.height.split("px")[0]) / 2;

        return (
        <StatsBox size={12} height={this.props.height}>
            <div className="statsboxContent" style={{height: this.props.height}}>
                <div id={this.state.containerId} style={{ height : containerHeight}}>
                    <svg viewBox="0 0 150 210" className="svg-progress-circle">
                        <circle r={radius} className="progress-inactive progress-circle"/>
                        <circle r={radius} className="progress-active progress-circle"
                                strokeDasharray={progress_fill}
                                strokeDashoffset={circle_fill_offset} />

                        <text x="50%" y="50%" className="progress-value">{valueText}</text>
                        <text x="45.5%" y="60%" className="data-metrics">{metricsSymbol}</text>
                    </svg>
                </div>

                <BoxHeader text={this.props.name} lineHeight="80px"/>

            </div>
        </StatsBox>
        );
    }//render
}//class

export default PercentCircle;
