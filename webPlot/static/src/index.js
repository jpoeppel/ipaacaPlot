import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import io from "socket.io-client";


import {XYPlot, XAxis, YAxis, Borders,
        LineSeries, LineSeriesCanvas,
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis";

import './index.css';


class Chart extends Component {

    constructor(props) {
        super(props);
        this.state = {
                    svg: true,
                    fixed_x: false
                    };
                    
        this.createChannelCtrl = this.createChannelCtrl.bind(this);
    }
    
    
    createChannels(channels) {
        //console.log("channels: ", channels);
        return channels.map( (c) => {
            
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
    
    render() {
        
        let {id, channels, tileIDs, width, height} = this.props;
        let min=0, max = 0;
        let barPresent = false;
        
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
            min = Math.max(0, max - 10);
            max = Math.max(10, max);
     //   }
        return (
            <div className="tile">
                Chart number: {id}
                <XYPlot height={height} width={width} 
                        dontCheckIfEmpty={false}
                        xType={barPresent ? "ordinal" : "linear"}
                        xDomain={this.state.fixed_x ? [min,max] : null} >
                    
                    {this.createChannels(channels)}
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
                <button onClick={() => this.setState({svg: !this.state.svg})} >
                    { this.state.svg ? "Render on Canvas" : "Render as svg"}
                </button>
                <button onClick={() => this.setState({fixed_x: !this.state.fixed_x})} >
                    { this.state.fixed_x ? "Unfix x-Axis" : "Fix x-Axis"}
                </button>
                <div className="channelCtrl">
                    { this.createChannelCtrl(channels, tileIDs)}
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
    width: 800,
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
        channels.forEach( (c) => {
            if (c.id === channelId) {
                c.mark = (input.value !== "none") ? input.value : null;
            }
        
        });
    }
    
    update_channel_tile(channelId, input) {
        const channels = this.state.channels;
        
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
        
        //Update channel's tile
        channels.forEach( (c) => {
            if (c.id === channelId) {
                c.tile = newTile;
            }
        });
        
        this.setState( {
            tiles: newTiles,
            tileCounter: newTileCounter
        })
        
        /* TODO: remove empty tiles */
    
    }
    
    update_channel_color(channelId, input) {
        const channels = this.state.channels;
        channels.forEach( (c) => {
            if (c.id === channelId) {
                c.color = input.value;
            }
        
        });
        this.setState({
            channels: channels
        });
    }
    
    componentDidMount() {
        this.socket = io.connect("http://localhost:5002");
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.update_data);
    }
    
    update_data(msg) {
    console.log("received data: ", msg);
        let channel = msg.channel;
        let payload = msg.y;
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
