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

/*
        <Tabs defaultActiveKey={1} id="tabs-as-navigation" style={{}}>
            <Tab eventKey={1} title="Chord Diagram" style={{}}>
                <Chords Target="tabs-as-navigation-1" />
            </Tab>
            <Tab eventKey={2} title="Memory Management">
                <Flatgrids/>
            </Tab>
        </Tabs>

<nav className="navbar navbar-default">
  <div className="container-fluid">

    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul className="nav navbar-nav col-md-12">
        <li className="active col-md-5"><a href="#">Link <span className="sr-only">(current)</span></a></li>
        <li className="col-md-5"><a href="#">Link</a></li>
      </ul>
    </div>
  </div>
</nav>


*/


        return (
        <div/>

        );
    }//render

}//class


export default Middle;
