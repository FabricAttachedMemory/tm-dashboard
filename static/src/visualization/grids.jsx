'use strict';
import React from 'react';
import {render} from 'react-dom';
import {Grid, Col} from 'react-bootstrap';


class Flatgrids extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            rowGap : props.RowGap, // Keep props as "origin" and
            colGap : props.ColGap, // Do not modify during runtime.
            size : props.Size,
            isRerender : false,
            isZoomInPressed : false,
            booksMap : [],
            numberOfBooks : 1200,
            isZoomOutPressed : false
        }

        //Have to register class methods to be reference with "this" during Runtime.
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }//constructor


    spoofData(){
        var newColors = [];
        var list = []
        for(var i=0; i < this.state.numberOfBooks; i++){
            var min = Math.ceil(-1);
            var max = Math.floor(4); //max is exclusive
            var randState = Math.floor(Math.random() * (max - min) + min);
            list.push(randState);
        }

        for (var i=0; i < list.length; i++) {
            var bookState = list[i];
            if (bookState == -1){
              newColors.push("boxOffline");
            }else if (bookState == 1){
              newColors.push("boxAllocated");
            }else if (bookState == 0){
              newColors.push("boxAvailable");
            }else if (bookState == 2){
              newColors.push("boxNotReady");
            }
        }
        return { dataSet : list, colorSet : newColors};
    }


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
        var spoofed = this.spoofData();
        this.state.booksMap = spoofed.dataSet;
        var colorClasses = spoofed.colorSet;
        var numOfBricks = this.state.booksMap.length;

        var ColsToDraw = []
        var colGap = this.state.colGap;
        var rowGap = this.state.rowGap;
        var index = 0

        //Building boxes list to be rendered
        for(var col=0; col < colorClasses.length; col++){
            var gridBoxOverride = {
                "margin" : colGap + "px " + rowGap + "px " + colGap + "px " + rowGap,
                "width" : this.state.size,
                "height" : this.state.size,
            };
            var classNames = "gridBox " + colorClasses[index];
            ColsToDraw.push(<div key={col} className={classNames} style={gridBoxOverride}></div>);
            index = index + 1;
        }//for

        return (
        <div className="gridCanvas"  onKeyDown={this.onKeyPress}>
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
