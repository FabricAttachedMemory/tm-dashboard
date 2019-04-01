'use strict';
import React     from 'react';
import PropTypes from 'prop-types';


class ApiRequester extends React.Component {

    //This is needed to 'define" (?) "this.props" variable that contains other
    //properties to be used in this class. It almost feels like defining class
    //variables in Python: self.props={};
    constructor(props){
        super(props);
        var resp_model = {
                            "value" : -1,
                            "status" : undefined,
                            "url" : undefined
                            }
        this.state = {
            displayData : "", //DEPR
            percent : -1,
            failedFetchCount : 0, //count how many times a failed request to api was made.
            forceRerender : false,
            fetched : undefined,
            index: 0,
            spoofedData : this.props.spoofedData,
            intervalId : -1,
            model : resp_model,
        }

        this.spoofData              = this.spoofData.bind(this);
        this.GetData                = this.GetData.bind(this);
 //       this.readFetchedValues      = this.readFetchedValues.bind(this);
        this.shouldComponentUpdate  = this.shouldComponentUpdate.bind(this)
        this.componentWillMount     = this.componentWillMount.bind(this);
    }//constructor


    spoofData(){
        return "";
    }//spoofData


    /* Make an ajax call to the API and save the return state into this.state.fetched.
     * Note, it will return at least two states during the runtime. First, it
     * is a "Promise" object of type Response. It is used in this class to
     * identify that the call has been made. When server response back, fetched
     * will become a json object containing the response values. */
    GetData() {
        var url= this.props.url; //just shorter to use during debugging
        if(!url){
            return;
        }

        var fetchParam = {
            method: "GET",
            headers: {
                "Accept" : "application/json; version=1.0",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept,"
            }
        }//fetchParam

        return fetch (url, fetchParam).then((data) => {
            this.state.fetched = data;
            return data.json();
        }).then((json) => {
            this.setState({
                fetched : json
            });
            this.setState({forceRender : true });
            return json;
        }).catch((error) => {
            console.log("GetData() error fetching '" + this.props.url + "'! [" + error + "]");
            this.setState({ fetched : this.state.model });
        });
    }//GetData


    //One of the first functions in the React lifecicle to be called.
    componentWillMount(){
        this.GetData();
        this.state.intervalId = setInterval(() => {
            if (this.state.failedFetchCount >= this.props.spoofAfterFails){
                console.log("Failed fetch! Doing nothing?");
            }else{
                this.GetData();
            }
        }, this.props.refreshRate);
    }//componentWillMount


    componentWillUnmount(){
        if(this.state.intervalId != -1)
            clearInterval(this.state.intervalId);
    }//componentWillUnmount


    /* This is called when this.setState() function is used.
     * Re-render the page only when fetch() request is finished and returned
     * object that is not of a "Response" type.*/
    shouldComponentUpdate(nextProps, nextState){
        var willUpdate = this.getUpdateState(nextProps, nextState);
        return willUpdate;
    }//shouldComponentUpdate


    getUpdateState(nextProps, nextState){
        var isResponse = nextState.fetched instanceof Response;
        var isObject = nextState.fetched instanceof Object;
        var isReady = !isResponse && isObject;

        if(this.state.forceRerender == true){
            this.state.forceRerender = false;
            return true;
        }//if

        return isReady;
    }//getUpdateState


    readFetchedValues(){
        var result = this.state.model;
        //{ "value" : -1, "url" : undefined, "status" : undefined }

        if(!this.state.fetched){
            return result;
        }
        if (this.state.fetched.value !== undefined){
           result["value"] = this.state.fetched.value;
        }

        return result
    }//readFetchedValues

}//class


ApiRequester.defaultProps = {
    height  : "300px",
    className : "",
    url     : "",
    refreshRate     : 5000,
    spoofAfterFails : 2,
    spoofedData     : []
}


ApiRequester.propTypes = {
    name : PropTypes.string.isRequired,
}

export default ApiRequester;
