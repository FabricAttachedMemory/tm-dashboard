'use strict';
/* This is a rect component that creates a Precentage Circle to display system
 * load status: cpu, fam, fabric... It is using <svg> html element to render
 * circles and other tags and properties to customize the circles, so that it
 * looks like a "loader".
 * It is using "css/precentcircle.css" stylesheet located in THIS folder with the
 * script.
*/
import React from 'react';
import {render} from 'react-dom';
import * as d3 from 'd3'

//ommiting extension of the file. Webpack config will figure it out by looking for .css or .scss
import css from './css/stats'
import StatsBox from './statsBox'


class PercentCircle extends React.Component {
// Component that renders a Precentage Cicle.
//
// Usage: import PercentCircle from "components/percentcircle"
//        <PercentCircle percentage="50" name="CPU">
//
// @param "percentge": value between 0 and 100 to be used to display "progress"
//                     status of the circle bar.
// @param "name": name for the component to be displayed Under the Circle on the page.

    constructor(props){
    //This is needed to 'define" (?) "this.props" variable that contains other
    //properties to be used in this class. It almost feels like defining class
    //variables in Python: self.props={};
        super(props);
        var id = this.props.name.split(" ");
        this.state = {
            percent : -1,
            failedFetchCount : 0, //count how many times a failed request to api was made.
            isSpoofed : false,
            forceRerender : false,
            containerId : id.join("_") + "_container",
            fetched : null
        }
    }//constructor


    spoofData(){
        this.state.isSpoofed = true;
        this.setState({percent : Math.floor(Math.random() * 100)});
    }


    GetData() {
        /* Make an ajax call to the API and save the return state into this.state.fetched.
         * Note, it will return at least two states during the runtime. First, it
         * is a "Promise" object of type Response. It is used in this class to
         * identify that the call has been made. When server response back, fetched
         * will become a json object containing the response values.
        */
        var url= this.props.url; //just shorter to use during debugging
        if(!url){
            console.log("Empty url string!");
            this.state.failedFetchCount += 1;
            if (this.state.failedFetchCount >= this.props.spoofAfterFails)
                this.spoofData();
            return;
        }

        var fetchParam = {
            method: "GET",
            headers: {
                "Accept" : "application/json; version=1.0",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*"
            }
        }//fetchParam

        return fetch (url, fetchParam).then((data) => {
            this.setState({
                fetched : data
            });
            return data.json();
        }).then((json) => {
            this.setState({
                fetched : json
            });

            return this.state.fetched;
        }).catch((error) => {
            console.log("GetData() error fetching '" + this.props.url + "'! [" + error + "]");
        });
    }//GetData


    //One of the first functions in the React lifecicle to be called.
    componentWillMount(){
        setInterval(() => {
            if(!this.state.fetched || this.state.fetched == null)
                this.GetData();
        }, this.props.refreshRate);
    }//componentWillMount


    shouldComponentUpdate(nextProps, nextState){
        /* This is called when this.setState() function is used.
         * Re-render the page only when fetch() request is finished and returned
         * object that is not of a "Response" type.*/
        var isResponse = nextState.fetched instanceof Response;
        var isObject = nextState.fetched instanceof Object;
        var isReady = !isResponse && isObject;

        if(this.state.isSpoofed == true){
            this.state.isSpoofed = false;
            return true;
        }//if

        if(this.state.forceRerender == true){
            this.state.forceRerender = false;
            return true;
        }//if

        return isReady;
    }//shouldComponentUpdate


    readFetchedValues(){
        if(!this.state.fetched)
            return;
        var apiValue = -1;
        var json = this.state.fetched;
        if('value' in json)
            apiValue = json['value']

        this.state.percent = Math.round(apiValue * 100.0) / 100.0;
    }//readFetchedValues


    render () {
        this.readFetchedValues();

        //Radius of the circle that was set in css/stats.css.
        var radius = 100;

        //SVG's property strokeDasharray is calculated to render the "filling" of
        //the circle.
        var progress_fill = radius * 2 * Math.PI;
        //How much filling to do of the circle based of desired precentage.
        var circle_fill_offset = ((100 - this.state.percent) / 100) * progress_fill;
        circle_fill_offset = (circle_fill_offset < 0 ) ? 0 : circle_fill_offset;

        var valueText = (this.state.percent < 0) ? "No Data" : this.state.percent;
        var metricsSymbol = parseInt(valueText);
        metricsSymbol = (isNaN(metricsSymbol)) ? "" : "%";

        this.state.fetched = null; //Resetting fetched for the next circle\interval.

        return (
            <StatsBox size={12} height={this.props.height} mgBottom="5px" mgLeft="0%" mgRight="0%">

                    <div id={this.state.containerId} style={{height : "70%", marginTop: "2.5em" }}>
                        <svg viewBox="0 0 150 220" className={css.svgCircle}>
                            <circle r={radius} className={[css.progress, css.circle].join(' ')}/>
                            <circle r={radius} className={[css.progress_inactive, css.circle].join(' ')}
                                    strokeDasharray={progress_fill}
                                    strokeDashoffset={circle_fill_offset} />

                            <text x="50%" y="50%" className={css.precent_text}>{valueText}</text>
                            <text x="47.5%" y="75%" className={css.precent_symbol}>{metricsSymbol}</text>
                        </svg>
                    </div>

                    <div className={["col-md-12 ", css.dscContainer].join(' ')}>
                        <text className={css.dsc}>{this.props.name}</text>
                    </div>

            </StatsBox>
        );
    }//render


}//class


// Those are the "default values" for the PrecentCircle component.
// If you use it with no parameters: <PercentCircle />, it would be equivalent
// to <PercentCircle percentage="0" name="">
PercentCircle.defaultProps = {
    percentage : 0,
    height : "300px",
    name : "",
    url : "",
    refreshRate : 5000,
    spoofAfterFails : 0
}

//VOODOO, something to do with the way Imports works in React..
//https://stackoverflow.com/questions/31852933/why-es6-react-component-works-only-with-export-default
export default PercentCircle;
