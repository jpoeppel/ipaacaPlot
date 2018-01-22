import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {XYPlot,FlexibleWidthXYPlot, XAxis, YAxis, Borders, Hint, AbstractSeries,
        LineSeries, LineSeriesCanvas, 
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis"; // ./3rdParty/


import ChartControls from "./chartControls";
import Text from "./textplot";

export default class Chart extends Component {

    constructor(props) {
        super(props);
        this.state = {
                    svg: true,
                    fixed_x: false,
                    xRange: null,
                    yRange: null
                    };
                    
        this.onWheel = this.onWheel.bind(this);
    }
    

    componentWillReceiveProps(nextProps){
        console.log("new chart props: ", this.props == nextProps);
    }
    
    createTextChannels(channels) {
        return channels.map( (c) => {
            //Create copy in order to trigger rendere when data changes!
            //let tmpData =c.data.slice();
            return <Text data={c.data} />
        
        });
    
    }
    
    createChannels(channels) {
                
        return channels.map( (c) => {
            /*
            return <Series  key={c.id}
                            plottype={c.plottype} 
                            data={c.data}
                            color={c.color}
                            mark={c.mark}
                            svg={this.state.svg}
                />
            */
            
            switch (c.plottype) {
            
                case "line":
                    let Line = this.state.svg ? LineSeries : LineSeriesCanvas;
                    return [c.mark ? <CustomSVGSeries customComponent={c.mark} data={c.data} style={{stroke: 'red', fill: 'orange'}} /> : null,
                                <Line data={c.data} stroke={c.color} />
                            ]
                    break;
                case "bar":
                    let Bar = this.state.svg ? VerticalBarSeries : VerticalBarSeriesCanvas;
                    return <Bar data={c.data} color={c.color} />
                    break;
                default:
                    return "Invalid plottype";
            }
          
        });
    
    }

    
    createChartCtrl(channels, tileIDs) {
        let options = tileIDs.map( (tile) => {
                                    return <option value={tile}>{tile}</option>
                                });
        options = options.concat(<option value="new">New</option>);
    
        let markOptions = ["star", "square", "circle", "diamond", "none"].map( 
                            (option) => {
                                 return <option value={option}>{option}</option>   
                            });
                            
                            
        return (
            <ChartControls title={"Chart settings"} group={"Series"}>
                  <div name={"Series"}>
                      {channels.map( (c) => {
                          return ([
                          <div>
                              <div> Channel: {c.id} </div>
                             <div> Plottype: {c.plottype} </div> 
                             <div> Display in panel: <select  
                                                value={c.tile}
                                                onInput={ (e) => {
                                                    this.props.tileChanged(c.id, e.target);
                                                    }
                                                }
                                          >
                                            {options}
                                         </select>
                             </div>
                             <div> Color:  <input type="color" id="color" 
                                            value={c.color} 
                                            onInput={ (e) => {
                                                this.props.colorChanged(c.id, e.target);
                                                }
                                            } />
                            </div>
                            <button onClick={ () => {this.props.togglePauseChannel(c) } } >
                               {c.paused ? "Resume Channel" : "Pause Channel"}
                             </button>                            
                             <button onClick={ () => {this.props.removeChannel(c) } } >
                                Remove Channel
                             </button>
                         </div> 
                         ])})
                      }
                  </div>
                  <div name={"Display"} >
                      <button onClick={() => this.setState({svg: !this.state.svg})} >
                            { this.state.svg ? "Render on Canvas" : "Render as svg"}
                      </button>
                      <div> Show only last: <input type="text" id="xRange" />
                          <button onClick={() => {
                              let xRange = document.getElementById("xRange").value;
                              
                              if (xRange === "0") {
                                  this.setState({xRange: null})
                              } else {
                                  this.setState({xRange: xRange})
                              }
                          }}>
                            {"Update"}
                      </button>
                      </div>
                      <div> Y Range min: 
                          <input type="text" id="yRangeMin"/>
                          max: <input type="text" id="yRangeMax"/>
                          <button onClick={() => {
                              let yRangeMin = document.getElementById("yRangeMin").value;
                              let yRangeMax = document.getElementById("yRangeMax").value;
                              
                              if (yRangeMin === "") {
                                  yRangeMin = null;
                              }
                              if (yRangeMax === "") {
                                  yRangeMax = null;
                              }
                              let yRange = null;
                              if (yRangeMin !== null || yRangeMax !== null) {
                                  yRange = [yRangeMin, yRangeMax];
                              }
                              
                              this.setState({yRange:yRange})
                      
                          }}>
                            {"Update"}
                      </button>
                      <button onClick={() => {
                              this.setState({yRange: null})
                              document.getElementById("yRangeMin").value = "";
                              document.getElementById("yRangeMax").value = "";
                          }}>
                            {"Clear"}
                      </button>
                      </div>
                  </div>
              </ChartControls>
        
        )
    }
    
    
    onWheel(event) {
    
        console.log("Used MouseWheel on plot");
        console.log("event: ", event.deltaY);
    
    };
    
    render() {
        let {id, channels, tileIDs, width, height} = this.props;
        let { xRange } = this.state;
        let min=0, max = 0;
        let barPresent = false;
        let numTicks = 0;
        var textChannels = [];
     //   if (this.state.fixed_x) {
            
            channels.forEach( (c) => {
                if (c.data.length > 0) {
                    min = Math.min(min, c.data[0].x);
                    max = Math.max(max, c.data[c.data.length-1].x)
                }
                if (c.plottype === "bar") {
                    barPresent = true;  
                }
                
                if (c.plottype === "text") {
                    textChannels.push(c);
                }
            });
            
        var plotChannels = channels.filter( c => (c.plottype !== "text"));
        
        if (xRange !== null) {
            min = Math.max(0, max - xRange);
            numTicks = max-min > 20 ? null : max-min;
        } else {
            min = Math.max(0, max - 10);
        }
        
        max = Math.max(10, max);
            
        
     //   }
        return (
            <div className="tile">
                Chart number: {id}
                <FlexibleWidthXYPlot height={height}
                        dontCheckIfEmpty={false}
                        onWheel={this.onWheel}
                        xType={barPresent ? "ordinal" : "linear"}
                        xDomain={this.state.xRange ? [min,max] : null} 
                        yDomain={this.state.yRange}
                        margin={{"left": 80, "right": 40}}>
                    {this.createChannels(plotChannels)}
                    
                    <Borders style={{
                    bottom: {fill: '#fff'},
                    left: {fill: '#fff'},
                    right: {fill: '#fff'},
                    top: {fill: '#fff'}
                  }}/>
                    <XAxis tickTotal={this.state.xRange ? numTicks : null} />
                    <YAxis />
                </FlexibleWidthXYPlot>
                <div className="textPlots">
                    {this.createTextChannels(textChannels)}
                </div>
                <div className="chartCtrl">
                    { this.createChartCtrl(channels, tileIDs)}
                </div>
            </div>
    );
  }

}

Chart.propTypes = {
    width:      PropTypes.number,
    height:     PropTypes.number,
    tileIDs:    PropTypes.array
}

Chart.defaultProps = {
    channel:    "",
    color: "black",
    width: 500,
    height: 300
}