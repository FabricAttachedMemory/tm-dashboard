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
import {BrowserRouter, Redirect, Router, Route, HashRouter } from 'react-router-dom'

import Skeleton             from './skeleton'
import POverview            from './overview'
import PMemoryManagement    from './memoryManagement'

import PercentCircle    from    './components/percentcircle';
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
            isAllowBrowser : false
        };

        this.allowBrowser = this.allowBrowser.bind(this);
    }//ctor


    allowBrowser(e){
        e.preventDefault(); //voodoo I don't care about.
        this.setState({isAllowBrowser : true});
    }//allowBrowser


    shouldComponentUpdate(nextProps, nextState){
        return nextState.isAllowBrowser != this.state.isAllowBrowser;
    }//shouldComponentUpdate


    /* Render a warning page for non-Chrome based browser. */
    renderNoBrowserSupport(){
        return(
        <div className="row">
            <div className="row">
                <div className="col-md-12 hpeFont" style={{textAlign : "center"}}>
                    <div className="col-md-3"></div>
                        <div className="col-md-6">
                            <h1>
        Due to the use of SVG elements on this page that are rendered differently
        in This browser, we <u>recommend using Chrome</u>, since that is where we
        get the most consistant (and intended) components alignment and rendering.
                            </h1>
                        </div>
                    <div className="col-md-3"></div>
                </div>
            </div>

            <div className="row" style={{textAlign:"center",
                                        padding: "0px",
                                        width:"100%"}}>
                <div className="col-md-12">
                    <button className="btn btn-warning"
                            onClick={this.allowBrowser}>

                        Continue...

                    </button>
                </div>
            </div>
        </div>
        );
    }//renderNoBrowserSupport


    /* A normal layout of the ED page */
    renderPages(){
        return(
            <HashRouter>
                <div>
                    <Redirect from="/" to="/overview" />
                    <Route path="/overview" component={POverview} />
                    <Route path="/mm" component={PMemoryManagement} />
                </div>
            </HashRouter>
        );
    }//renderPages


    /* Display Warning page for non-Chrome based browsers. Render button that
    will allow to preceed further with rendering a normal page. */
    render() {
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        return (
            <div>
                { isChrome == true || this.state.isAllowBrowser ? this.renderPages() : this.renderNoBrowserSupport() }
            </div>
        );

    }//render

}//class



render(<SystemLoadStats />, document.getElementById('SystemLoadStats'));
