'use strict';
import React from 'react';
import {render} from 'react-dom';

import ApiRequester from '../components/base/apiRequester'

/* Render grids visualization of the Book states. This is a Memory Management
tab. The main idea is to make an LMP call to get all known books data. It will
have a value between -1 to 3 (or so) to represent each book's state. Knowing that,
this class creates a small Box element (which is <div> with height and width) for
each book and assignes a color to it based on status. Then, render all books
to the screen.

Stylesheet used: css/grids.css
Inherited from: components/base/ApiRequester.jsx

Note: since it inheritce ApiRequester, we can't use defaultProps here, or it will
override parent's props. The workaround is to check if a prop was set when this
component is instantiated. If not - assign some default value to a this.state
and use that later in the code.
*/
class Flatgrids extends ApiRequester{

    constructor(props) {
        super(props);

        /* !!! Do not set state using "this.state = {}", or this will override
            parent's this.state. !!!*/
        this.state.size     = (this.props.Size === undefined) ? 8 : props.Size;
        this.state.rowGap   = (this.props.RowGap === undefined) ? 10 : props.RowGap;
        this.state.colGap   = (this.props.ColGap === undefined) ? 10 : props.ColGap;

        this.state.isRerender       = false;
        this.state.isZoomInPressed  = false;
        this.state.booksMap         = [];
        this.state.numberOfBooks    = 1200;
        this.state.isZoomOutPressed = false;

        //Have to register class methods to be reference with "this" during Runtime.
        this.onKeyDown  = this.onKeyDown.bind(this);
        this.onKeyUp    = this.onKeyUp.bind(this);
    }//constructor


    spoofData(){
        super.spoofData();

        var newColors = [];
        var list = []
        for(var i=0; i < this.state.numberOfBooks; i++){
            var min = Math.ceil(-1);
            var max = Math.floor(4); //max is exclusive
            var randState = Math.floor(Math.random() * (max - min) + min);
            list.push(randState);
        }//for

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
    }//spoofData


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


    shouldComponentUpdate(nextProps, nextState){
        var isParentFetched = super.shouldComponentUpdate(nextProps, nextState);
        return this.state.isZoomInPressed ||
                this.state.isZoomOutPressed ||
                this.state.isRerender ||
                isParentFetched;
    }//componentWillUpdate


    render() {
        this.readFetchedValues(); //doesn't do anyhthing for this component yet.

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

export default Flatgrids;
