'use strict';
import React from 'react';
import {render} from 'react-dom';
import StatsBox from './wrappers/statsBox'


class Header extends React.Component {

    constructor(props){
        super(props);
    }

    render() {

        //Based of: https://www.bootply.com/98314
        return (
        <div>
            <div className="col-md-2">
                <img className="header-logo" src={require('./hpe_logo.png')}/>
            </div>
            <div className="col-md-8 header-name">
                The Machine Executive Dashboard
            </div>
            <div className="col-md-2 header-right">
                torms-li2
            </div>
        </div>

        );
    }//render
}

export default Header;
