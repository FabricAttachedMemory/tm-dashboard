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

import Skeleton from './skeleton'
import Overview from './overview'

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
    }//ctor


    render() {

        return (
            <HashRouter>
                <div>
                    <Redirect from="/" to="/overview" />
                    <Route path="/overview" component={Overview} />
                </div>
            </HashRouter>
        );

    }//render

}//class



render(<SystemLoadStats />, document.getElementById('SystemLoadStats'));
