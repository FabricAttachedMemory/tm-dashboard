'use strict';
import React from 'react';
import {render} from 'react-dom';


class ApiRequester extends React.Component {

    constructor(props){
    //This is needed to 'define" (?) "this.props" variable that contains other
    //properties to be used in this class. It almost feels like defining class
    //variables in Python: self.props={};
        super(props);
        var id = this.props.name.split(" ");
        this.state = {
            percent : -1,
            failedFetchCount : 0, //count how many times a failed request to api was made.
            isSpoofed : false,
            forceRerender : false,
            containerId : id.join("_") + "_container",
            fetched : null,
        }

        this.spoofData = this.spoofData.bind(this)
        this.GetData = this.GetData.bind(this)
        this.readFetchedValues = this.readFetchedValues.bind(this)
    }//constructor


    spoofData(){
        this.state.isSpoofed = true;
        this.setState({percent : Math.floor(Math.random() * 100)});
    }


    GetData() {
        /* Make an ajax call to the API and save the return state into this.state.fetched.
         * Note, it will return at least two states during the runtime. First, it
         * is a "Promise" object of type Response. It is used in this class to
         * identify that the call has been made. When server response back, fetched
         * will become a json object containing the response values.
        */
        var url= this.props.url; //just shorter to use during debugging
        if(!url){
            console.log("Empty url string!");
            this.state.failedFetchCount += 1;
            if (this.state.failedFetchCount >= this.props.spoofAfterFails)
                this.spoofData();
            return;
        }

        var fetchParam = {
            method: "GET",
            headers: {
                "Accept" : "application/json; version=1.0",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*"
            }
        }//fetchParam

        return fetch (url, fetchParam).then((data) => {
            this.setState({
                fetched : data
            });
            return data.json();
        }).then((json) => {
            this.setState({
                fetched : json
            });

            return this.state.fetched;
        }).catch((error) => {
            console.log("GetData() error fetching '" + this.props.url + "'! [" + error + "]");
        });
    }//GetData


    //One of the first functions in the React lifecicle to be called.
    componentWillMount(){
        setInterval(() => {
            if(!this.state.fetched || this.state.fetched == null)
                this.GetData();
        }, this.props.refreshRate);
    }//componentWillMount


    shouldComponentUpdate(nextProps, nextState){
        /* This is called when this.setState() function is used.
         * Re-render the page only when fetch() request is finished and returned
         * object that is not of a "Response" type.*/
        var isResponse = nextState.fetched instanceof Response;
        var isObject = nextState.fetched instanceof Object;
        var isReady = !isResponse && isObject;

        if(this.state.isSpoofed == true){
            this.state.isSpoofed = false;
            return true;
        }//if

        if(this.state.forceRerender == true){
            this.state.forceRerender = false;
            return true;
        }//if

        return isReady;
    }//shouldComponentUpdate


    readFetchedValues(){
        if(!this.state.fetched)
            return;
        var apiValue = -1;
        var json = this.state.fetched;
        if('value' in json)
            apiValue = json['value']

        this.state.percent = Math.round(apiValue * 100.0) / 100.0;
    }//readFetchedValues

}


ApiRequester.defaultProps = {
    percentage : 0,
    height : "300px",
    name : "",
    url : "",
    refreshRate : 5000,
    spoofAfterFails : 0,
}


export default ApiRequester;
