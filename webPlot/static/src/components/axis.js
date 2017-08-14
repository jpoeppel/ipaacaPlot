import React, { Component } from 'react';
import PropTypes from 'prop-types';

/* Axis component inspired largely by 
https://gist.github.com/MrToph/49e564044e43a260cd44a35674d57ce7
*/

class Axis extends Component {

    render() {
        let {orientation, length, scale, height, shift, invert} = this.props;
        let start = 0;
        const TICKSIZE = 6;
        let end = (orientation === "bottom") ? start + length : start-length;
        
        
        let otherCoord = 0;
        let x1,x2,y1,y2,dx,dy = 0;
        let ticksx,ticksy, ticksdif;
        if (orientation === "bottom") {
            x1 = start;
            x2 = end;
            y1 = y2 = height - otherCoord;
            dy = 3 * TICKSIZE;
            ticksx = (p) => { return scale(p) +shift };
            ticksy = (p) => { return y1 };
            ticksdif = (p) => {return y1+ TICKSIZE };
        } else {
            x1 = x2 = otherCoord;
            y1 = height;
            y2 = 0;
            ticksx = (p) => { return x1 };
            ticksy = (p) => { return invert ? height-(scale(p) + shift) : scale(p) + shift };
            ticksdif = (p) => {return x1 - TICKSIZE };
            dx = -1.5* TICKSIZE;
            dy = 0.5 * TICKSIZE;
        }
        
        let ticks = (scale.ticks ? scale.ticks() : scale.domain()).map( (p,i) => {
            return ( 
                <path
                    key={p}
                    d={`M${ticksx(p)},${ticksy(p)}${orientation === "bottom" ? "V" : "H"}${ticksdif(p)}`}
                    stroke='#000'
                    fill='#000'
                    strokeWidth='1'
                />
            )
        });
            
        let labels = (scale.ticks ? scale.ticks : scale.domain)().map( (p,i) => {
            return ( 
                <text
                    key={p}
                    fill='#000'
                    x={ticksx(p)}
                    y={ticksy(p)}
                    dx={dx}
                    dy={dy}
                    textAnchor={orientation ==="bottom" ? "middle" : "end"}
                >
                {(scale.tickFormat ? scale.tickFormat() : (p) => {return p})(p)}
                </text>
            )
        });

        
        return (
            <g className="axis" fill="none">
                <line
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    stroke='#000'
                    strokeWidth='1'
                />
                {ticks}
                {labels}
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

Axis.defaultProps = {
    shift:  0
}

export default Axis;