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
        );
    }//render
}

export default Header;
