'use strict';
import React        from 'react';
import PropTypes    from 'prop-types';
import {render}     from 'react-dom';


/* A component used to render "Header" name of the side panels' boxes, such
as "CPU", "Rack Overview" and etc...
This is just a text wrapped around <div> and middle aligned. Since the same
set was used in various places with a slight variation of alignment, it made
sense to make a component out of it. */
class BoxHeader extends React.Component {

    constructor(props){
        super(props);
    }


    render() {
        var boxStyle ={
            padding      : "0px",
            height       : this.props.height,
            lineHeight   : this.props.lineHeight,
            textAlign    : this.props.textAlign,
            paddingLeft  : this.props.paddingLeft,
            paddingRight : this.props.paddingRight
        };
        return (
            <div className={"data-container-name " + this.props.className}
                    id={this.props.id}
                            style={boxStyle}>
                {this.props.text}
            </div>
        );
    }
}


BoxHeader.defaultProps = {
    text : PropTypes.string.isRequired, // Text to display - a header.
    className : "",
    id : "",
    height: "60px", // size of the wrapper <div>. Works like a margin in this case.
    lineHeight: "60px", // verticle alignment of the header relative to wrapped <div>
    textAlign : "center", //horizontal allignment of the header text.
    paddingLeft : "0x",
    paddingRight : "0px"
}


export default BoxHeader;
