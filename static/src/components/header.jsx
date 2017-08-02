'use strict';
import React from 'react';
import {render} from 'react-dom';
import StatsBox from './wrappers/statsBox'


class Header extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
/*

        <nav className="navbar navbar-default" role="navigation">
            <div className="navbar-header">
                <span className="navbar-brand" href="#">
                    The Machine Executive Dashboard
                </span>
            </div>

            <div className="navbar-collapse collapse">
                <ul className="nav navbar-nav navbar-left">
                    <li>
                            <img className="logo" src={require('./standin.png')}/>
                    </li>
                </ul>

                <ul className="nav navbar-nav navbar-right">
                    <li>
                        <a href="#contact">
                            torms-li2
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
*/


        //Based of: https://www.bootply.com/98314
        return (
        <div className="row header">
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
