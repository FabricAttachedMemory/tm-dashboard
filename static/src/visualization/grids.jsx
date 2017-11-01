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
and use that later in the code. */
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
        this.state.isZoomOutPressed = false;

        this.state.booksMap         = new Array(154).fill(0);
        this.state.numberOfBooks    = 1200;
        this.state.maxBooksToRender = 2000;

        //Have to register class methods to be reference with "this" during Runtime.
        this.onKeyDown  = this.onKeyDown.bind(this);
        this.onKeyUp    = this.onKeyUp.bind(this);
    }//constructor

/*
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
*/



    /** Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }//shuffleArray



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


    make_alloc_set(data_set){
        if(data_set === undefined)
            return {};
        if(data_set.active_books === undefined) //data_set is not a valid data
            return {};

        var numOfBooks = data_set.total;
        if (numOfBooks > this.state.maxBooksToRender)
            numOfBooks = this.state.maxBooksToRender

        var alloc_state = [];

        var allocated   = new Array(data_set.allocated).fill(1);
        var offline     = new Array(data_set.offline).fill(-1);
        var notReady    = new Array(data_set.notready).fill(2);
        var available   = [];

        var totalSize = allocated.length + offline.length + notReady.length;
        if (totalSize < numOfBooks)
            available = new Array(numOfBooks - totalSize).fill(0);

        alloc_state = alloc_state.concat(allocated);
        alloc_state = alloc_state.concat(offline);
        alloc_state = alloc_state.concat(notReady);
        alloc_state = alloc_state.concat(available);

        alloc_state = this.shuffleArray(alloc_state);

        var alloc_colors = {};
        for (var i=0; i < alloc_state.length; i++) {
            var bookState = alloc_state[i];
            if (bookState == -1)
              alloc_colors[i] = "boxOffline";

            if (bookState == 1)
              alloc_colors[i] = "boxAllocated";

            if (bookState == 0)
              alloc_colors[i] = "boxAvailable";

            if (bookState == 2)
              alloc_colors[i] = "boxNotReady";
        }//for
        return alloc_colors;
    }//make_alloc_set


    render() {
        //doesn't do anyhthing for this component yet.
        var allocs = this.make_alloc_set(this.state.fetched);

        if(Object.keys(allocs).length === 0)
            allocs = this.state.booksMap;
        else
            this.state.booksMap = allocs;

        var colGap = this.state.colGap;
        var rowGap = this.state.rowGap;
        var ColsToDraw = []
        //Building boxes list to be rendered
        //for(var col=0; col < colorClasses.length; col++){
        for(var book_index in allocs){
            var gridBoxOverride = {
                "margin" : colGap + "px " + rowGap + "px " + colGap + "px " + rowGap,
                "width" : this.state.size,
                "height" : this.state.size,
            };
            var classNames = "gridBox " + allocs[book_index];
            ColsToDraw.push(<div key={book_index} className={classNames}
                                    style={gridBoxOverride}></div>);
        }//for

        return (
        <div className="gridCanvas"  onKeyDown={this.onKeyPress}>
            {ColsToDraw}
        </div>
        );
    }//render

}//class

export default Flatgrids;
