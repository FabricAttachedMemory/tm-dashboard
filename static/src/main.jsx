'use strict'; //https://stackoverflow.com/questions/1335851/what-does-use-strict-do-in-javascript-and-what-is-the-reasoning-behind-it
              //in a nutshell, this will make the compiler more "verbose" and Exception and Error trigger happy...
/* global fetch:true */
/*
 *  This is the Main script that connects all the piecies of the webpage together,
 * and writes it into the html element. In this case, Percentage Circle component
 * is re-used to create CPU, FAM, FAB circle stats and then written into the HTML
 * element that has ID=SystemLoadStats.
*/
import React from 'react';
import {render} from 'react-dom';

import PercentCircle    from    './components/percentcircle';
import InfoSquare       from    './components/infoSquare';
import Header           from    './components/header';
import Middle           from    './components/middle';


class SystemLoadStats extends React.Component{
// This class is responsible for rendering the Left side of the Executive Dashboard
// where three Precentage Circles are located. This class groups them all into
// one <div>, so that you could write them all as one element into the HTML code.


// <----PROPS---->
    constructor(props) {
        super(props);
        this.state = {
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        }
    }//ctor


    getHeight(offset, divider){
        return (window.innerHeight - offset) / divider;
    }//getHeight


    getWidth(offset, divider){
        return (window.innerWidth - offset) / divider;
    }


    componentWillMount(){
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }//componentWillMount


    componentDidMount(){
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }//componentDidMount


    updateDimensions(){
        this.setState({
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        });
        console.log("Here");
    }//updateDimensions


    shouldComponentUpdate(nextProps, nextState){
        var isHeightChanged = (this.state.windowHeight != window.innerHeight);
        var isWidthChanged = (this.state.widnowWidth != window.innerWidth);
        return isHeightChanged || isWidthChanged;
    }//shouldComponentUpdate


    render() {
        var cpuUrl = "10.33.234.150";
        var headerClasses = "col-md-12";
        var sidesClasses = "col-md-2";
        var middleClasses = "col-md-8";
        var leftBoxHeight = this.getHeight(60, 3) + "px";
        var middleBoxHeight = this.getHeight(50, 1) + "px";
        var sidesMaxWidth = "300px";
        var middleWidth = this.getWidth(615, 1) + "px";

        return (
            <div className="row" style={{marginTop: "0px", marginBottom:"0px"}}>
                    <div className={headerClasses} style={{padding:"0px", marginBottom: "0.5em"}}>
                        <Header/>
                    </div>


                    <div className={sidesClasses} style={{maxWidth : sidesMaxWidth}}>

                            <PercentCircle name="CPU" height={leftBoxHeight} />

                            <PercentCircle name="Fabric Attached Memory" height={leftBoxHeight}/>

                            <PercentCircle name="Fabric" height={leftBoxHeight}/>

                    </div>


                    <div className={middleClasses}
                        style={{
                            padding: "0px",
                            width: middleWidth,
                            background: "#4C5E6C",
                            height : middleBoxHeight }}>
                        <Middle/>
                    </div>


                    <div className={sidesClasses} style={{ width: sidesMaxWidth }}>
                        <InfoSquare number='14' desc="ACTIVE SHELVES"/>
                        <InfoSquare number="1,792" desc="BOOKS"/>
                    </div>

            </div>
        );

    }//render

}//class


// Write\Render Precentage Circles into the HTML element when the page is loaded.
render(<SystemLoadStats />, document.getElementById('SystemLoadStats'));
