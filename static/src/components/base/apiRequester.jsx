'use strict';
import React from 'react';
import {render} from 'react-dom';


class ApiRequester extends React.Component {

    //This is needed to 'define" (?) "this.props" variable that contains other
    //properties to be used in this class. It almost feels like defining class
    //variables in Python: self.props={};
    constructor(props){
        super(props);

        this.state = {
            percent : -1,
            failedFetchCount : 0, //count how many times a failed request to api was made.
            isSpoofed : false,
            forceRerender : false,
            fetched : null,
            index: 0,
            spoofedData : this.props.spoofedData
        }

        this.spoofData = this.spoofData.bind(this);
        this.GetData = this.GetData.bind(this);
        this.readFetchedValues = this.readFetchedValues.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this)
        this.componentWillMount = this.componentWillMount.bind(this);
    }//constructor


    spoofData(){
        if(this.state.spoofedData.length == 0)
            this.state.spoofedData = [0,1,2,3,4,5,6,7,8,9,15,32,44,48,50,66,73,81,97,100];

        this.state.isSpoofed = true; //cant setState here. Browser complains...
        if (this.state.index > (this.state.spoofedData.length - 1)){
            this.state.index = 0;
        }else{
            this.state.percent = this.state.spoofedData[this.state.index];
            this.state.index = this.state.index + 1;
        }
    }//spoofData


    GetData() {
        /* Make an ajax call to the API and save the return state into this.state.fetched.
         * Note, it will return at least two states during the runtime. First, it
         * is a "Promise" object of type Response. It is used in this class to
         * identify that the call has been made. When server response back, fetched
         * will become a json object containing the response values.
        */
        var url= this.props.url; //just shorter to use during debugging
        if(!url){
            if(!this.state.isSpoofed)
                console.log("Empty url string!");
            this.state.failedFetchCount += 1;
            //if (this.state.failedFetchCount >= this.props.spoofAfterFails){
            //    this.spoofData();
            //}
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
            if (this.state.failedFetchCount >= this.props.spoofAfterFails){
                this.spoofData();
                this.setState({isSpoofed : true}); //signal component to check for re-render
                return;
            }
            if(!this.state.fetched || this.state.fetched == null){
                if(!this.state.isSpoofed)
                    this.GetData();
            }
        }, this.props.refreshRate);
    }//componentWillMount


    /* This is called when this.setState() function is used.
     * Re-render the page only when fetch() request is finished and returned
     * object that is not of a "Response" type.*/
    shouldComponentUpdate(nextProps, nextState){
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

}//class


ApiRequester.defaultProps = {
    percentage : 0,
    height : "300px",
    name : "",
    url : "",
    refreshRate : 2000,
    spoofAfterFails : 0,
    spoofedData : []
}


export default ApiRequester;
