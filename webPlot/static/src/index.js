import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import io from "socket.io-client";

import {XYPlot,FlexibleWidthXYPlot, XAxis, YAxis, Borders, Hint, AbstractSeries,
        LineSeries, LineSeriesCanvas,
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis"; // ./3rdParty/


import CollapsibleCard from "./components/collapsibleCard";
import ChartControls from "./components/chartControls";

//import {VictoryChart, VictoryTheme, VictoryLine} from "victory";

import './index.css';


class Series extends AbstractSeries {

    constructor(props) {
        super(props);
        
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


class Chart extends Component {

    constructor(props) {
        super(props);
        this.state = {
                    svg: true,
                    fixed_x: false,
                    xRange: null
                    };
                    
        this.createChannelCtrl = this.createChannelCtrl.bind(this);
    }
    
    
    createVictoryChannels(channels) {
/*        
        return channels.map( (c) => {
        
            if (c.plottype === "line") {
            
                return <VictoryLine
                    style={{
                      data: { stroke: c.color },
                      parent: { border: "1px solid #ccc"}
                    }}
                    data={c.data}
                  />
            
            }
        
        });
  */  
    }
    
    createChannels(channels) {
        console.log("channels: ", channels);
        

                
                
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
            if (c.plottype === "line") { 
                let Line = this.state.svg ? LineSeries : LineSeriesCanvas;
                return [c.mark ? <CustomSVGSeries customComponent={c.mark} data={c.data} style={{stroke: 'red', fill: 'orange'}} /> : null,
                            <Line data={c.data} stroke={c.color} />
                        ]
                        
                
            } else if (c.plottype === "bar" ) {
                let Bar = this.state.svg ? VerticalBarSeries : VerticalBarSeriesCanvas;
                return <Bar data={c.data} color={c.color} />
                
            } else {
                return "Invalid plottype"        
            }
          
        });
    
    }
    
    createChannelCtrl(channels, tileIDs) {

        let options = tileIDs.map( (tile) => {
                                    return <option value={tile}>{tile}</option>
                                });
        options = options.concat(<option value="new">New</option>);
    
        let markOptions = ["star", "square", "circle", "diamond", "none"].map( 
                            (option) => {
                                 return <option value={option}>{option}</option>   
                            });
    
        return channels.map( (c) => {
            return (
                <div>
                    <span> Channel: {c.id} </span>
                    <span> Plottype: {c.plottype} </span>  
                    <span> Color:  <input type="color" id="color" 
                                value={c.color} 
                                onInput={ (e) => {
                                    this.props.colorChanged(c.id, e.target);
                                    }
                            } />
                    </span>
                    <span> Add mark: <select value={c.mark ? c.mark : "none"}
                                                onInput={ (e) => {
                                                    this.props.markChanged(c.id, e.target);
                                                    }
                                                }
                                          >
                                            {markOptions}
                                         </select>
                    </span>
                    <span> Display in panel: <select  
                                                value={c.tile}
                                                onInput={ (e) => {
                                                    this.props.tileChanged(c.id, e.target);
                                                    }
                                                }
                                          >
                                            {options}
                                         </select>
                    </span>
                    <button onClick={ () => {this.props.removeChannel(c) } } >
                        Remove Channel
                    </button>
                </div>
                )
        }); 
    }
    
    
    createChannelCtrl2(channels, tileIDs) {
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
                  </div>
              </ChartControls>
        
        )
    }
    
    render() {
        console.log("rendering chart");
        let {id, channels, tileIDs, width, height} = this.props;
        let { xRange } = this.state;
        let min=0, max = 0;
        let barPresent = false;
        let numTicks = 0;
     //   if (this.state.fixed_x) {
            
            channels.forEach( (c) => {
                if (c.data.length > 0) {
                    min = Math.min(min, c.data[0].x);
                    max = Math.max(max, c.data[c.data.length-1].x)
                }
                if (c.plottype === "bar") {
                    barPresent = true;  
                }
            });
            
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
                        xType={barPresent ? "ordinal" : "linear"}
                        xDomain={this.state.xRange ? [min,max] : null} 
                        margin={{"left": 80, "right": 40}}>
                    {this.createChannels(channels)}
                    <Borders style={{
                    bottom: {fill: '#fff'},
                    left: {fill: '#fff'},
                    right: {fill: '#fff'},
                    top: {fill: '#fff'}
                  }}/>
                    <XAxis tickTotal={this.state.xRange ? numTicks : null} />
                    <YAxis />
                </FlexibleWidthXYPlot>
                <div className="channelCtrl">
                    { this.createChannelCtrl2(channels, tileIDs)}
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


class ChannelCtrl extends Component {

 
    render() {
    
        let tiles = this.props.tiles;
        
        let options = tiles.map( (tile) => {
                                    return <option value={tile.id}>{tile.id}</option>
                                });
        options = options.concat(<option value="new">New</option>);
    
        return (
            <div>
                Channel: <input type="text" id="channel" />
                Plottype: <select id="plottype">
                            <option value="line">Lineplot</option>
                            <option value="bar">Barplot</option>
                          </select>     
                Color:  <input type="color" id="color" />
                Add to panel: <select id="tile">
                                {options}
                            </select>
                
                <button onClick={this.props.addChannel} >
                    Add Channel
                </button>
            </div>
        )
    }
}

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tiles: [],
            channels: [],
            tileCounter: 0
        };
        
        
        //this.channels = [];
        
        this.addChannel = this.addChannel.bind(this);
        this.removeChannel = this.removeChannel.bind(this);
        this.createTile = this.createTile.bind(this);
        this.update_data = this.update_data.bind(this);
        this.update_channel_color = this.update_channel_color.bind(this);
        this.update_channel_tile = this.update_channel_tile.bind(this);
        this.update_channel_mark = this.update_channel_mark.bind(this);
    
    }
        
    update_channel_mark(channelId, input) {
        const channels = this.state.channels;
        //const channels = this.channels;
        channels.forEach( (c) => {
            if (c.id === channelId) {
                c.mark = (input.value !== "none") ? input.value : null;
            }
        
        });
    }
    
    update_channel_tile(channelId, input) {
        const channels = this.state.channels;
        //const channels = this.channels;
        
        let newTiles = this.state.tiles;
        const tileCounter = this.state.tileCounter;
        let newTileCounter = tileCounter;
        
        let newTile = input.value;
        if (newTile === "new") {
            newTile = tileCounter;
            
            newTiles = newTiles.concat([{
                id: tileCounter, 
                numChannels: 1,
                channel: channelId }])
            newTileCounter = tileCounter+1;
        } 
        
        
        let oldTile = null;
        
        
        //Update channel's tile
        channels.forEach( (c) => {
            if (c.id === channelId) {
                oldTile = c.tile;
                c.tile = newTile;
            }
        });
        
        newTiles.forEach( (t) => {
            if (t.id === oldTile) {
                t.numChannels = t.numChannels -1;
            }
        });
        
        
        newTiles = newTiles.filter( (t, i, a) => {
            return t.numChannels !== 0;
        })
        
        console.log("Old tile: ", oldTile);
        console.log("tiles: ", newTiles);
        
        this.setState( {
            tiles: newTiles,
            tileCounter: newTileCounter
        })
        
        /* TODO: remove empty tiles */
    
    }
    
    update_channel_color(channelId, input) {
        //const channels = this.channels;
        const channels = this.state.channels;
        channels.forEach( (c) => {
            if (c.id === channelId) {
                c.color = input.value;
            }
        
        });
        this.forceUpdate();
     /*   this.setState({
            channels: channels
        });
    */
    }
    
    componentDidMount() {
        this.socket = io.connect("http://localhost:5000");
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.update_data);
    }
    
    update_data(msg) {
   // console.log("received data: ", msg);
        let channel = msg.channel;
        let payload = msg.y;
        //let channels = this.channels.slice()
        let channels = this.state.channels.slice();
        channels.forEach( (c) => {
            console.log("channel id: ", c.id);
            if (c.id === channel) {
                if (c.plottype === "line") {
                    c.data.push({"x":c.data.length, "y":payload[0], "size":c.markSize, "style":{"fill":c.color}});
                } else if (c.plottype === "bar") {
                   // let chars = ["a","b","c","d","e","f"]
                    c.data = msg.dist.map( (v, i) => { return {"x":i, "y":v}});
                }
            } 
        });
        
        
        this.setState({
            channels: channels
        })
        
    }
    
    createTile(tile) {
        //let channels = this.channels.filter( (c) => {return c.tile === tile.id });
        let channels = this.state.channels.filter( (c) => {return c.tile === tile.id });
       // console.log("Channels: ", channels);
        return (
            <Chart 
                id={tile.id}
                key={tile.id}
                removeChannel={this.removeChannel} 
                channels={channels}
                colorChanged={this.update_channel_color}
                tileChanged={this.update_channel_tile}
                markChanged={this.update_channel_mark}
                tileIDs={this.state.tiles.map( (tile) => {return tile.id})}
            >
            </Chart>
        )
    }
    
    removeChannel(channel) {

        /* TODO: Handle corner case of the same channel being in one chart 
                 multiple times. 
        */
        
        //filter out all channels with this id
        let channels = this.state.channels.filter( (c) => {return c !== channel });
        //let channels = this.channels.filter( (c) => {return c !== channel });
        let tiles = this.state.tiles;
        tiles.forEach( (t) => {
            if (channel.tile === t.id) {
                t.numChannels = t.numChannels-1;
            }
        });
        let newTiles = tiles.filter( (t) => {return t.numChannels !== 0});
        
        
       // console.log("new tiles: ", toRem);
        this.setState( {
            channels: channels,
            tiles: newTiles
        });
        
        let remChannel = true;
        channels.forEach( (c) => {
            if (c.id === channel.id) {
                remChannel = false;
            }
        });
        if (remChannel) {
            this.socket.emit("remove_channel", channel.id );
        }
    
    }
    
    removeChannel_old(tileId) {
        let tiles = this.state.tiles;
        
        var toRem = -1;
        let removedChannel = "";
        for (var i=0; i<tiles.length; i++) {
            if (tiles[i].id === tileId) {
                removedChannel = tiles[i].channel;
                toRem = i;
                break;
            }
        }
        
        if (toRem > -1) {
            
            tiles.splice(toRem, 1);
        }
        
       // console.log("new tiles: ", toRem);
        this.setState( {
            tiles: tiles
        });
        
        this.socket.emit("remove_channel", removedChannel );
    
    }
    
    addChannel() {
        console.log("Add channel pressed");
        let channel = document.getElementById("channel").value;
        
        if (channel.indexOf(":") === -1) {
            channel = "rsb:" + channel;
        }
        let plottype = document.getElementById("plottype").value;
        let color = document.getElementById("color").value;
        let tileId = document.getElementById("tile").value;
        
        const tiles = this.state.tiles;
        const tileCounter = this.state.tileCounter;
        //const channels = this.channels;
        
        const channels = this.state.channels;
        
        let newTiles, newTileCounter;
        if (tileId === "new") {
            tileId = tileCounter;
            newTiles = tiles.concat([{
                id: tileCounter, 
                numChannels: 1,
                channel: channel }])
            newTileCounter = tileCounter+1;
        } else {
            newTiles = tiles;
            newTiles.forEach( (t) => {
                if (t.id === Number(tileId)) {
                    t.numChannels = t.numChannels+1;
                }
            });
            newTileCounter = tileCounter;
        }
        
        let newChannels = channels.concat([{
                    id: channel,
                    plottype: plottype,
                    tile: Number(tileId),
                    color: color,
                    data: [],
                    mark: null,
                    markSize: 5}]);
                    
        this.setState( {
            tiles: newTiles,
            tileCounter: newTileCounter,
            channels: newChannels
            });
            
        //this.channels = newChannels;
            
        this.socket.emit("add_channel", channel);
        
    }
  
    render() {
  
        let tiles = this.state.tiles
        return (
            <div>
                <div className="header">
                    <div className="title">
                        <h1> My first dashboard try </h1>
                    </div>
                    <div className="ctrl">
                        <ChannelCtrl 
                            addChannel={this.addChannel} 
                            tiles={this.state.tiles}
                        />
                    </div>
                 </div>
                 <div className="tile-board">
                    {tiles.map(this.createTile)}
                 </div>
                 
            </div>  
    );
  }
}

// ========================================

ReactDOM.render(
  <Dashboard />,
  document.getElementById('dashboard')
);
