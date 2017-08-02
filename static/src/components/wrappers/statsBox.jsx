'use strict';
/* This is a rect component that creates a Precentage Circle to display system
 * load status: cpu, fam, fabric... It is using <svg> html element to render
 * circles and other tags and properties to customize the circles, so that it
 * looks like a "loader".
 * It is using "css/precentcircle.css" stylesheet located in THIS folder with the
 * script.
*/
import React from 'react';
import {render} from 'react-dom';


class StatsBox extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            height : "300px"
        }
    }//constructor



    render() {
        var cmpMargin = [this.props.mgTop, this.props.mgRight, this.props.mgBottom, this.props.mgLeft ];

        return (
            <div className={["col-md-" + this.props.size, "statsbox"].join(' ')}
                style={{margin : cmpMargin.join(' '),
                        height: this.props.height }}>
                {this.props.children}
            </div>
        );
  }//render


}//class


StatsBox.defaultProps = {
    size : 12,
    height : "300px",
    mgTop : "0",
    mgRight : "0",
    mgBottom : "0",
    mgLeft : "0"
}

export default StatsBox;
