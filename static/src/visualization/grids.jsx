'use strict';
import React from 'react';
import {render} from 'react-dom';
import {Grid, Col} from 'react-bootstrap';
import CSS from './css/grids'


class Flatgrids extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            rowGap : props.RowGap, // Keep props as "origin" and
            colGap : props.ColGap, // Do not modify during runtime.
            size : props.Size,
            isRerender : false,
            isZoomInPressed : false,
            isZoomOutPressed : false,
        }

        //Have to register class methods to be reference with "this" during Runtime.
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }//constructor


    onKeyDown(event){
        /* Listen for the keyboard inputs from the user. Set variable flags when
        interested keys are pressed. */
        if(event.key == "]")

            this.setState( { isZoomInPressed : true} );
        if(event.key == "[")
            this.setState( { isZoomOutPressed : true} );
    }//onKeyDown


    onKeyUp(event){
        /* Unset flags on release of keyboard keys by the user.*/
        if(event.key == "]"){ //zoom in grid boxes
            this.setState( {
                    isZoomInPressed : false,
                    rowGap : this.state.rowGap + 1,
                    colGap : this.state.colGap + 1,
                    size: this.state.size + 1,
                    } );
        }//key ]

        if(event.key == "["){ //zoom out grid boxes
            this.setState( {
                    isZoomOutPressed : false,
                    rowGap : this.state.rowGap - 1,
                    colGap : this.state.colGap - 1,
                    size: this.state.size - 1,
                    } );
        }//key [

        if(event.key == "o"){ //Reset grids view to origin
            this.setState( {
                    isRerender : true,
                    isZoomOutPressed : false,
                    isZoomInPressed : false,
                    rowGap : this.props.RowGap,
                    colGap : this.props.ColGap,
                    size: this.props.Size,
                    } );
        }//key o

    }//onKeyUp


    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }//componentDidMount


    componentWillUpdate(prevState, nextState){
        return this.state.isZoomInPressed || this.state.isZoomOutPressed || this.state.isRerender;
    }//componentWillUpdate


    render() {
        var numOfBricks = 1200;
        var ColsToDraw = []
        var colGap = this.state.colGap;
        var rowGap = this.state.rowGap;
        var colors = ["#2AD2C9","#FD9A69","#865CD6","#DC2878"];


        //Building boxes list to be rendered
        for(var col=0; col < numOfBricks; col++){
            var gridBoxOverride = {
                "margin" : colGap + " " + rowGap + " " + colGap + " " + rowGap, // margin: up right down left
                "width" : this.state.size,
                "height" : this.state.size,
                "backgroundColor" : colors[Math.floor(Math.random()*colors.length)]
            };
            ColsToDraw.push(<div key={col} className={CSS.gridBox} style={gridBoxOverride}></div>);
        }//for

        return (
        <div className={CSS.gridCanvas}  onKeyDown={this.onKeyPress}>
            {ColsToDraw}
        </div>
        );
    }//render

}//class


Flatgrids.defaultProps = {
    Size    : 8,  //both width and height
    RowGap  : 10,
    ColGap  : 10,
}//defaultProps


export default Flatgrids;
