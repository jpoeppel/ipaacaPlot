import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from "d3";
import Axis from './axis';


/* d3 v4 LineChart for react, inspired by 
http://blog.bigbinary.com/2016/02/04/using-d3-js-with-react-js.html
*/

class Line extends Component {

    render() {
        let {path, stroke, fill, strokeWidth } = this.props;
        return (
            <path
                d={path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
        );
    }
}

Line.propTypes = {
    path:           PropTypes.string.isRequired,
    stroke:         PropTypes.string,
    fill:           PropTypes.string,
    strokeWidth:    PropTypes.number
};

Line.defaultProps = {
    stroke:     'blue',
    fill:       'none',
    strokeWidth: 3
};


class DataSeries extends Component {

    render() {
        let { data, colors, interpolationType, xScale, yScale} = this.props;
        
        
        
        /* d3 line generator */
        let line = d3.line()
            .curve(interpolationType)
            .x((d,i ) => { return xScale(i); })  
            .y((d) => { return yScale(d); });
            
            
        let lines = data.map((series, id) => {
            return (
                <Line
                    path={line(series)}
                    stroke={colors(id)}
                    key={id}
                />        
            );
        });
        
        return (
            <g>
                <g>{lines}</g>
            </g>
        );
    }
}

DataSeries.propTypes = {
    colors:             PropTypes.func,
    data:               PropTypes.array,
    interpolationType:  PropTypes.func,
    xScale:             PropTypes.func,
    yScale:             PropTypes.func
}

DataSeries.defaultProps = {
    data:               [],
    interpolationType:  d3.curveCardinal.tension(1),/*'cardinal'*/
    colors:             d3.scaleOrdinal(d3.schemeCategory10)
}

class LineChart extends Component {
    render() {
        let { width, height, data } = this.props;
        
        let maxValues = d3.max(data.map( (arr) => {return arr.length-1}));
        /* Create xScale with domain 0-number of elements */
        let xScale = d3.scaleLinear()
                    .domain([0, maxValues])
                    .range([0, width]);    
                    
        /* Create yScale with domain 0-max entry */            
        let yScale = d3.scaleLinear()
                    .range([height, 10])
                    .domain([0, d3.max(data.map( (arr) => {return d3.max(arr)}))]);
                    
        return (
            <svg width={width} height={height}>
                <DataSeries 
                    data={data}
                    width={width}
                    height={height}
                    xScale={xScale}
                    yScale={yScale}
                />
                <Axis 
                    orientation={"bottom"} 
                    length={width} 
                    scale={xScale} 
                    numTicks={maxValues} 
                    height={height}
                />
            </svg>
        );
    }
}

LineChart.propTypes = {
    width:  PropTypes.number,
    height: PropTypes.number,
    data:   PropTypes.array.isRequired

}

LineChart.defaultProps = {
    width:  500,
    height: 300
}

export default LineChart;
