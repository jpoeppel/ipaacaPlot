import React, { Component } from 'react';

import {XYPlot, XAxis, YAxis, Borders,
        LineSeries, LineSeriesCanvas,
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis";
        
        
class Series extends Component {

    render() {
        let {data, plottype, mark, color} = this.props;
        
        if (plottype === "line") { 
                let Line = this.state.svg ? LineSeries : LineSeriesCanvas;
                return [mark ? <CustomSVGSeries customComponent={mark} 
                                                data={data} 
                                                style={{stroke: 'red', fill: 'orange'}} /> : null,
                            <Line data={data} stroke={color} />
                        ]
                        
                
        } else if (plottype === "bar" ) {
            let Bar = this.state.svg ? VerticalBarSeries : VerticalBarSeriesCanvas;
            return <Bar data={data} color={color} />
            
        } else {
            return "Invalid plottype"        
        }
        
    }
            
    
}