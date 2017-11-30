import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import io from "socket.io-client";


import {XYPlot, XAxis, YAxis, Borders,
        LineSeries, LineSeriesCanvas,
        VerticalBarSeries, VerticalBarSeriesCanvas, 
        CustomSVGSeries} from "react-vis";

import './index.css';

import ChannelCtrl from "./channelCtrl";




class Channel extends Component {
/*
    Container class for a generic channel, which can contain multiple series!
*/
    
    update_data(data) {
        
    };
    
    
    render() {
    //Renders the channel based on it's type
    
    };
}

Channel.propTypes = {
    protocol:      PropTypes.string,
    channel:       PropTypes.string,
    callback:      PropTypes.func  
}

Channel.defaultProps = {
}


class Series extends Component {
/*
    Container class for all series data
*/


}


class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tiles: [],
            tileCounter: 0
        };
        
        this.channels = [];
        
        
        // Binding functions
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