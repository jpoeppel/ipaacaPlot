import React, { Component } from 'react';

import {XYPlot,FlexibleWidthXYPlot, XAxis, YAxis, Borders, Hint, AbstractSeries,
        LineSeries, LineSeriesCanvas,
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis"; 
        
        
class Series_test extends Component {

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



export default class Series extends AbstractSeries {

    constructor(props) {
        super(props);
        console.log("Series constructor");
        this.requiresSVG = this.requiresSVG.bind(this);
        this.isCanvas = this.isCanvas.bind(this);
    }


    requiresSVG() {
        return this.props.svg;
      }
    
    isCanvas() {
        return !this.props.svg;
    }
    
    static renderLayer(props, ctx) {
        console.log("Props: ", props);
        if (!props.svg) {
            if (props.plottype === "line") { 
                LineSeriesCanvas.renderLayer(props,ctx);
            } else if (props.plottype === "bar" ) {
                VerticalBarSeriesCanvas.renderLayer(props,ctx);
            }
        }   
    
    }
    

    render() {
        console.log("Rendering series");
        let {data, plottype, mark, color, svg} = this.props;
        const props = this.props;
        if (!svg) {
            return null;
        }
        if (plottype === "line") { 
                let Line = svg ? LineSeries : LineSeriesCanvas;
                return <Line data={data} stroke={color} 
                                //Props passed down from XYPlot
                                {...this.props}
                            />
                
        } else if (plottype === "bar" ) {
            let Bar = svg ? VerticalBarSeries : VerticalBarSeriesCanvas;
            return <Bar data={data} color={color} 
                                //Props passed down from XYPlot
                                {...this.props}
                    />
            
        } else {
            return "Invalid plottype"        
        }
        
    }
            
    
}
Series.displayName = 'Series';