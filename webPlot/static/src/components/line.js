uimport React, { Component } from 'react';
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
        let { width, height, data, padding, index } = this.props;
        
        let dataSlice = index ? data.slice(0,index) : data.slice()
        let numValues = d3.max(dataSlice.map( (arr) => {return arr.length-1}));
        /* Create xScale with domain 0-number of elements */
        let xScale = d3.scaleLinear()
                    .domain([0, numValues])
                    .range([0, width-2*padding]);    
                    
        /* Create yScale with domain 0-max entry */            
        let yScale = d3.scaleLinear()
                    .range([height, padding])
                    .domain([0, d3.max(dataSlice.map( (arr) => {return d3.max(arr)}))]);
                    
        return (
            <svg width={width} 
                height={height} 
                transform={`translate(${padding},-${padding})`} >
                <DataSeries 
                    data={dataSlice}
                    width={width}
                    height={height}
                    xScale={xScale}
                    yScale={yScale}
                    
                />
                <Axis 
                    orientation={"bottom"} 
                    length={width-1.5*padding} 
                    scale={xScale}  
                    height={height}
                />
                <Axis 
                    orientation={"left"} 
                    length={height} 
                    scale={yScale} 
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
    width:  600,
    height: 300,
    padding: 40, /* padding around the figure which should remain clear, save for ticks */
}

export default LineChart;
