import React, { Component } from 'react';

import {XYPlot, XAxis, YAxis, Borders,
        LineSeries, LineSeriesCanvas,
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis";


import Series from "./Series";



class Tile extends Component {

    constructor(props) {
        super(props);
        this.state = {
                    svg: true,
                    fixed_x: false
                    };
    }
    
    render() {
        
        let {id, series, tileIDs, width, height} = this.props;
        let min=0, max = 0;
        let barPresent = false;
        
            
            series.forEach( (s) => {
                if (s.data.length > 0) {
                    min = Math.min(min, s.data[0].x);
                    max = Math.max(max, s.data[s.data.length-1].x)
                }
                if (c.plottype === "bar") {
                    barPresent = true;
                }
            });
            min = Math.max(0, max - 10);
            max = Math.max(10, max);
            
        return (
            <div className="tile">
                Chart number: {id}
                <XYPlot height={height} width={width}
                        dontCheckIfEmpty={false}
                        xType={barPresent ? "ordinal" : "linear"}
                        xDomain={this.state.fixed_x ? [min,max] : null} >
                    
                    {series.map( (s) => <Series key=s.id
                                                type=s.plottype
                                                data=s.data
                                                mark=s.mark
                                                color=s.color
                                        />
                    )}
                    <Borders style={{
                        bottom: {fill: '#fff'},
                        left: {fill: '#fff'},
                        right: {fill: '#fff'},
                        top: {fill: '#fff'}
                          }}
                    />
                    <XAxis />
                    <YAxis />
                </XYPlot>
                <div className="tileCtrl">
                    <button onClick={() => this.setState({svg: !this.state.svg})} >
                    { this.state.svg ? "Render on Canvas" : "Render as svg"}
                </button>
                </div>
            </div>
    );
  }

}

Tile.propTypes = {
    width:      PropTypes.number,
    height:     PropTypes.number,
    tileIDs:    PropTypes.array
}

Tile.defaultProps = {
    channel:    "",
    color: "black",
    width: 800,
    height: 300
}