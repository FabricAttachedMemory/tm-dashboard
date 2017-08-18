'use strict';
import React        from 'react';
import PropTypes    from 'prop-types';
import {render}     from 'react-dom';


/* TODO: documentation will be here soon. */
class NodeStats extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            data : this.props.data
        }
        this.state.data = this.ValidateAndDefault(this.state.data);
        console.log(this.state.data);
    }//ctor


    GetDataFields(){
        return [
                    ["Power State", "power"],
                    ["DRAM Usage", "dram"],
                    ["CPU Usage", "cpu"],
                    ["Network In", "netIn"],
                    ["Fabric Usage", "fabric"],
                    ["Network Out", "netOut"],
                    ["No. of Shelves", "shelves"],
                    ["OS Manifest", "manifestName"],
                    ["No. of Books", "books"],
                ];
    }//GetDataFields


    ValidateAndDefault(data){
        var expectedFields = this.GetDataFields();
        for(var i=0; i < expectedFields.length; i++){
            var field = expectedFields[i];
            if(field[1] in data)
                continue;
            data[field[1]] = "---";
        }
        return data;
    }//ValidateAndDefault


    BuildDataBox(title, subtitle){
        var boxSt = {
            height: "50px",
            fontFamily: "Arial",
            color: "white",
            fontSize: "12px"
        }
        var titleSt = {
            textAlign: "left",
        }
        return(
            <div className="col-md-6" style={boxSt}>
                <div style={titleSt}>
                    {title}
                </div>
                <div style={titleSt}>
                    {subtitle}
                </div>
            </div>
        );
    }//BuildDataBox


    render() {
        var boxes = [];
        for(var i=0; i < this.GetDataFields().length; i++){
            var field = this.GetDataFields()[i];
            var title = field[0];
            var value = this.state.data[field[1]];
            boxes.push(this.BuildDataBox(title, value));
        }//for
        return (
            <div className="gridCanvas">
                {boxes}
            </div>
        );
    }//render
}

NodeStats.defaultProps = {
    data : {}
}


export default NodeStats;
