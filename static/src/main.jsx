'use strict'; //https://stackoverflow.com/questions/1335851/what-does-use-strict-do-in-javascript-and-what-is-the-reasoning-behind-it
/* global fetch:true */
              //in a nutshell, this will make the compiler more "verbose" and Exception and Error trigger happy...
/*
 *  This is the Main script that connects all the piecies of the webpage together,
 * and writes it into the html element. In this case, Percentage Circle component
 * is re-used to create CPU, FAM, FAB circle stats and then written into the HTML
 * element that has ID=SystemLoadStats.
*/
import React from 'react';
import {render} from 'react-dom';
import {Grid, Row, Col, Navbar, Nav, NavItem, MenuItem} from 'react-bootstrap';
import PercentCircle from './components/percentcircle';
import InfoSquare from './components/infoSquare';
import Header from './components/header';
import Middle from './components/middle';


class SystemLoadStats extends React.Component{
// This class is responsible for rendering the Left side of the Executive Dashboard
// where three Precentage Circles are located. This class groups them all into
// one <div>, so that you could write them all as one element into the HTML code.


// <----PROPS---->
    constructor(props) {
        super(props);
        this.state = {
            percent: -1,
            fetched: ""
        };
    }

    render() {
        var cpuUrl = "10.33.234.150";

        return (
            <div className="row">
                <div className="col-md-13">
                    <Header/>
                </div>

                  <div className="col-md-2" style={{ }}>
                        <div className="row">
                            <PercentCircle name="CPU" marginBottom="0.4em"/>
                            <PercentCircle percentage={this.state.percent}
                                            name="Fabric Attached Memory"/>
                            <PercentCircle percentage={this.state.percent} name="Fabric"/>
                        </div>
                  </div>

                  <div className="col-md-8" style={{ margin : "0 0% 0 0%"}}>
                      <Middle />
                  </div>

                 <div className="col-md-2" style={{}}>
                      <InfoSquare number='14' desc="ACTIVE SHELVES"/>
                      <InfoSquare number="1,792" desc="BOOKS"/>
                 </div>

            </div>
        );

    }//render

}//class

// Write\Render Precentage Circles into the HTML element when the page is loaded.
render(<SystemLoadStats />, document.getElementById('SystemLoadStats'));
