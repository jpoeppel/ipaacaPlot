import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from "d3";


/* A bar chart for react, inspired by 
https://10consulting.com/2014/02/19/d3-plus-reactjs-for-charting/
and
https://github.com/yang-wei/rd3/tree/master/src/barchart
*/

class Bar extends Component {
    render () {
        let {width, height, fill, offset, availHeight } = this.props;
        return (
            <rect fill={fill} 
                width={width}
                height={height}
                x={offset}
                y={availHeight-height}
            />
            
        )
    
    }

}

Bar.propTypes = {
    width:          PropTypes.number.isRequired,
    height:         PropTypes.number.isRequired,
    offset:         PropTypes.number.isRequired,
    fill:           PropTypes.string
}

Bar.defaultProps = {
    fill: "blue"
}

class DataSeries extends Component {
    render() {
        let {data, title, xScale, yScale, height} = this.props;
        
        let bars = data.map( point =>  {
            return (
                <Bar height={yScale(point.val)} width={xScale.bandwidth()}
                    offset={xScale(point.key)} key={point.key}
                    availHeight={height} />
            )
        });
        
        return(
            <g>{bars}</g>
        )
    
    }

}

DataSeries.propTypes = {
    data:       PropTypes.array.isRequired,
    title:      PropTypes.string,
    width:      PropTypes.number,
    height:     PropTypes.number,
    xScale:     PropTypes.func,
    yScale:     PropTypes.func
}

DataSeries.defaultProps = {
    title:  ""
}

class BarChart extends Component {

    render () {
    
        let {data, width, height} = this.props;

        let xScale = d3.scaleBand()
                .domain(data.map( (p) => {return p.key}))
                .range([0, width])
                .padding(0.1);
                
        let yScale = d3.scaleLinear()
                .domain([0, d3.max(data.map( (p) => {return p.val}))])
                .range([0, height]);
        return (
            <svg width={width} height={height}>
                    <DataSeries 
                        data={data}
                        width={width}
                        height={height}
                        xScale={xScale}
                        yScale={yScale}
                    />
            </svg>
        )
    
    }

}

BarChart.propTypes = {
    width:  PropTypes.number,
    height: PropTypes.number,
    data:   PropTypes.array.isRequired

}

BarChart.defaultProps = {
    width:  600,
    height: 300
}


export default BarChart;