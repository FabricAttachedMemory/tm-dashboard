'use strict';
import React from 'react';
import {render} from 'react-dom';
import {Tabs, Tab, Col} from 'react-bootstrap'; //Bloody garbage! Need to use plain css bootstrap.

import Flatgrids from '../visualization/grids'
import Chords from '../visualization/chordWheel'


class Middle extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
        <Tabs defaultActiveKey={1} id="tabs-as-navigation" style={{}}>
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
