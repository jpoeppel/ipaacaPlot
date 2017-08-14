import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from "d3";

/* Axis component inspired largely by 
https://gist.github.com/MrToph/49e564044e43a260cd44a35674d57ce7
*/

class Axis extends Component {

    render() {
        let {orientation, length, scale, numTicks, height} = this.props;
        let start = 0;
        const TICKSIZE = length / 50;
        let end = (orientation === "bottom") ? start + length : start-length;
        
        let otherCoord = 0;
        let x1,x2,y1,y2;
        
        if (orientation === "bottom") {
            x1 = start;
            x2 = end;
            y1 = y2 = height - TICKSIZE - otherCoord;
        } else {
            x1 = x2 = otherCoord;
            y1 = start;
            y2 = end;
        }
        
        let ticks = () => {
            let res = [];
            let pos = 0;
            let step = Math.floor(length / (numTicks - 1));
            for (let i=0; i<=numTicks; i++) {
                pos = scale(i);
                let l = <line
                    key={pos}
                    stroke='#000'
                    strokeWidth='2'
                    x1={pos}
                    y1={y1}
                    x2={pos}
                    y2={y1 + TICKSIZE} />
                res.push(l);
            }
            
            return res
        }
        
        return (
            <g fill="none">
                <line
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    stroke='#000'
                    strokeWidth='3'
                />
                {ticks()}
            </g>
        )
        
    
    }
}

Axis.propTypes = {

    length:         PropTypes.number,
    orientation:    PropTypes.string,
    scale:          PropTypes.func,
    numTicks:       PropTypes.number
    
}

export default Axis;