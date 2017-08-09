'use strict';
import React from 'react';
import {render} from 'react-dom';
import {Navbar, Nav, NavItem, Tabs, Tab, Col} from 'react-bootstrap'; //Bloody garbage! Need to use plain css bootstrap.
import {LinkContainer} from "react-router-bootstrap";

import Flatgrids from '../visualization/grids'
import Chords from '../visualization/chordWheel'


class Middle extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        var paddings = [ "0px", this.props.paddingL, "0px", this.props.paddingR];

        return (
        <div className="col-md-12" style={{padding: paddings.join(' ')}}>
            <Navbar>
                <Nav bsStyle="tabs" justified activeKey={this.props.activeKey}>
                    <LinkContainer to="/overview">
                        <NavItem eventKey={1} >Overview</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/mm">
                        <NavItem eventKey={2} >Memory Management</NavItem>
                    </LinkContainer>
                </Nav>
            </Navbar>

            <div className="middle-content" style={{height: this.props.height}}>
                {this.props.children}
            </div>

        </div>
        );
    }//render
}//class


Middle.defaultProps = {
    activeKey : 1,
    height : "700px"
}


Middle.defaultProps = {
    paddingL : "0px",
    paddingR : "0px",
}


export default Middle;
