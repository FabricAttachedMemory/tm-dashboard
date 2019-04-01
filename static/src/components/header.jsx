'use strict';
import React from 'react';
import { ENDPOINT_TITLE } from '../constants/endpoints'

class Header extends React.Component {

    constructor(props){
        super(props);
        this.state = {
          'title' : ''
        }
        this.getTitle = this.getTitle.bind(this);
    }


    componentWillMount(){
      this.getTitle();
    }

    getTitle() {
      var url = ENDPOINT_TITLE;
      fetch (url).then((data) => {
        return data.json();
      }).then((json) => {
          if ('title' in json)
            this.setState( {'title' : json['title'] } )
          return json;
      })
    }//getTitle


    render() {
        //Based of: https://www.bootply.com/98314
        return (
        <div>
            <div className="col-md-2">
                <img className="header-logo" src={require('./hpe_logo.png')}/>
            </div>
            <div className="col-md-8 header-name">
                {this.state.title}
            </div>
            <div className="col-md-2 header-right">
                DEMO
            </div>
        </div>

        );
    }//render
}

export default Header;
