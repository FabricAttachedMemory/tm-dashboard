'use strict';
import React from 'react';
import {render} from 'react-dom';
import {Tabs, Tab, Col} from 'react-bootstrap'; //Bloody garbage! Need to use plain css bootstrap.

import Flatgrids from '../visualization/grids'
import Chords from '../visualization/chordWheel'
import CSS from './css/tabs'


class Middle extends React.Component {

    constructor(props){
        super(props);
    }
/*

        <Tabs defaultActiveKey={1} id="tabs-as-navigation" style={{margin: "0 2% 0 2%"}}>
            <Tab eventKey={1} title="Chord Diagram" style={{height : "100%"}}>
                <Chords Target="tabs-as-navigation-1" />
            </Tab>
            <Tab eventKey={2} title="Memory Management">
                <Flatgrids/>
            </Tab>
        </Tabs>

            <ul className="nav nav-tabs">
                <li role="presentation" class="active">
                    <a href="#">Overview
                        <Chords Target="tabs-as-navigation-1" />
                    </a>
                </li>
                <li role="presentation"><a href="#">Memory Management</a></li>
            </ul>
*/
    render() {
        return (
        <Tabs defaultActiveKey={1} id="tabs-as-navigation" style={ {margin: "0 0 0 0"}}>
            <Tab eventKey={1} title="Chord Diagram" style={{}}>
                <Chords Target="tabs-as-navigation-1" />
            </Tab>
            <Tab eventKey={2} title="Memory Management">
                <Flatgrids/>
            </Tab>
        </Tabs>
        );
    }//render

}//class


export default Middle;
