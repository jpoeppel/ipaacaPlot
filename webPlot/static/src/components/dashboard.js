import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import Chart from "./chart";
import TextOutput from "./textOutput";

import ChannelCtrl from "./channelCtrl";
import GridLayout from 'react-grid-layout';
import Element from "./element.js";


export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            textPlottype: false,
            tiles: [],
            textTiles: [],
            tileCounter: 0,
            textTileCounter: 0,
            channels: [],
            textChannels: [],
            channelCounter: 0,
            probeMessage: "",
            layout: []
        };
        
        this.channelMap = {};
        this.connectionMap = {};
        
        
        this.probingConnection = null;
        
        this.addSimpleChannel = this.addSimpleChannel.bind(this);
        this.removeChannel = this.removeChannel.bind(this);
        this.createTile = this.createTile.bind(this);
        this.createTextTile = this.createTextTile.bind(this);
        this.update_data = this.update_data.bind(this);
        this.update_channel_color = this.update_channel_color.bind(this);
        this.update_channel_tile = this.update_channel_tile.bind(this);
        this.update_channel_mark = this.update_channel_mark.bind(this);
        this.togglePauseChannel = this.togglePauseChannel.bind(this);
        this.selectPlottype = this.selectPlottype.bind(this);
        
        this.probeConnection = this.probeConnection.bind(this);
        this.addNewChannel = this.addNewChannel.bind(this);
        this.updateChannel = this.updateChannel.bind(this);


        // For Layout:
        this.onLayoutChange = this.onLayoutChange.bind(this);
        this.layoutLoaded = this.layoutLoaded.bind(this);
        this.colwidth = 100;
        this.rowHeight = 20;
    }

    layoutLoaded(newLayout) {
        this.setState({
            layout: newLayout
        })
    }
    
    updateChannel(connection, channelId, key, plottype, color, tileId) {
        
        let possibleChannels = this.connectionMap[connection] ? this.connectionMap[connection] : [];
        
        var channel;
        for (var i=0; i < possibleChannels.length; i++) {
            let tmpChannel = possibleChannels[i];
            if (tmpChannel.id === channelId){
                channel = tmpChannel;
                break;
            }
        }
        
        
        if (!channel) {
            channel = {
                id: channelId,
                connection: connection,
            }
            //Add new channel to channel and connection map
            this.channelMap[channelId] = channel;
            if (this.connectionMap[connection]) {
                this.connectionMap[connection].push(channel);
            } else {
                this.connectionMap[connection] = [channel];
            }
        }
        
        
        //Update channel attributes
        channel.key = key;
        channel.plottype = plottype;
        channel.color = color;
        channel.paused = false;
        
        //Update tiles
        const tiles = (plottype  === "text") ? this.state.textTiles : this.state.tiles;
        const tileCounter = (plottype  === "text") ? this.state.textTileCounter : this.state.tileCounter;
        const channels = (plottype  === "text") ? this.state.textChannels : this.state.channels;
        
        
        let newTiles, newTileCounter;
        if (tileId === "new") {
            tileId = tileCounter;
            newTiles = tiles.concat([{
                id: tileCounter, 
                numChannels: 1}])
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
        
        channel.tile = Number(tileId);
        
        let newChannels = channels.concat([channel]);
        
        //console.log("channels after activate: ", newChannels);
                    
        if (plottype  === "text") {
            this.setState( {
                textTiles: newTiles,
                textTileCounter: newTileCounter,
                textChannels: newChannels
                });
        } else {
            this.setState( {
                tiles: newTiles,
                tileCounter: newTileCounter,
                channels: newChannels
                });
        
        }
        
    };
    
    addNewChannel(connection) {
        this.socket.emit("add_connection", connection);
        //console.log("adding new channel for connection: ", connection);
        let emptyChannel = {
                id: this.state.channelCounter,
                key: "",
                connection: connection,
                plottype: "",
                tile: -1,
                color: "",
                data: [],
                mark: null,
                markSize: 5,
                paused: true
        }
        
        if (this.connectionMap[connection]) {
            this.connectionMap[connection].push(emptyChannel);
        } else {
            this.connectionMap[connection] = [emptyChannel];
        }
        
        this.channelMap[emptyChannel.id] = emptyChannel;
        
        
        //this.forceUpdate();
        this.setState({
            channelCounter: this.state.channelCounter+1,
        })
    };
    
    probeConnection(connection) {
        //console.log("Probing connection: ", connection);
        
        this.probingConnection = connection;
        
        // Reset probe Message to receive next message
        this.setState({
            probeMessage: ""
        })
        
        this.socket.emit("add_connection", connection);
    }
    
    selectPlottype(e) {
        var type = e.target.value;
        this.setState({textPlottype: type==="text"})
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
    
        let channel = this.channelMap[channelId];
    
        let newTiles = (channel.plottype === "text") ? this.state.textTiles : this.state.tiles;
        const tileCounter = (channel.plottype === "text") ? this.state.textTileCounter : this.state.tileCounter;
        let newTileCounter = tileCounter;
        
        let newTile = input.value;
        if (newTile === "new") {
            newTile = tileCounter;
            
            newTiles = newTiles.concat([{
                id: tileCounter, 
                numChannels: 1 }])
            newTileCounter = tileCounter+1;
        } 
        
        
        let oldTile = null;
        
        
        oldTile = this.channelMap[channelId].tile;
        this.channelMap[channelId].tile = newTile;
        
        //Update channel's tile
        //channels.forEach( (c) => {
        //    if (c.id === channelId) {
        //        oldTile = c.tile;
        //        c.tile = newTile;
        //    }
        //});
        
        
        newTiles.forEach( (t) => {
            if (t.id === oldTile) {
                t.numChannels = t.numChannels -1;
            }
        });
        
        newTiles = newTiles.filter( (t, i, a) => {
            return t.numChannels !== 0;
        })
        
        if (channel.plottype === "text")  {
            this.setState( {
                textTiles: newTiles,
                textTileCounter: newTileCounter
            })
        } else {
            this.setState( {
                tiles: newTiles,
                tileCounter: newTileCounter
            })
        }
    
    }
    
    togglePauseChannel(channel) {
        channel.paused = !channel.paused;
    }
    
    update_channel_color(channelId, input) {
        this.channelMap[channelId].color = input.value;
        this.forceUpdate();
    }
    
    componentDidMount() {
        this.socket = io.connect("http://localhost:5000", {transport:["websocket"]});
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.update_data);
    }
    
    update_data(msg) {
        // console.log("received data: ", msg);
        let connection = msg.connection;
        
        if (connection === this.probingConnection) { 
            //We only want one message, not constantly updating ones
            if (!this.state.probeMessage) {
                this.setState({
                    probeMessage: msg
                })
            }
        }
        
        let possibleChannels = this.connectionMap[connection] ? this.connectionMap[connection] :[]; 
        
        //console.log("possible channels for connection: ", possibleChannels)
        //Feed data to channels from this connection
        for (var i=0; i < possibleChannels.length; i++) {
        
            let channel = possibleChannels[i];
            let payload = msg[channel.key];
            //console.log("channel: ", channel);
            if (channel && !channel.paused) {
                switch(channel.plottype) {
                    case "line":
                        channel.data.push({"x":channel.data.length, "y": payload, 
                                    "size":channel.markSize, 
                                    "style":{"fill":channel.color}
                                });
                        break;
                    case "bar":
                        channel.data = payload.map( item => { 
                                                                if (item.length === 3) { 
                                                                    return {"x":item[0], "y":item[1], "color": item[2]}
                                                                } else {
                                                                    return {"x":item[0], "y":item[1]}
                                                                }
                                                            });
                        break;
                    case "text":
                        channel.data = payload; 
                        break;
                    default:
                        return "Invalid plottype"
                }
                //console.log("channel id: ", channel.id);
                //console.log("data after adding: ", channel.data);
            }
        } 
        
        this.forceUpdate();
        //this.setState(this.state);
        
        //Notify tiles
        
    }
    
    createTile(tile) {
        //let channels = this.channels.filter( (c) => {return c.tile === tile.id });
        let channels = this.state.channels.filter( (c) => {return c.tile === tile.id });
       // console.log("Channels: ", channels);
       let layout = this.state.layout;
        return (
            <Element key={tile.id} id={tile.id}>
                <Chart 
                    id={tile.id}
                    key={tile.id}
                    channels={channels}
                    removeChannel={this.removeChannel} 
                    togglePauseChannel={this.togglePauseChannel}
                    tileChanged={this.update_channel_tile}
                    markChanged={this.update_channel_mark}
                    colorChanged={this.update_channel_color}
                    tileIDs={this.state.tiles.map( (tile) => {return tile.id})}
                    width={layout[tile.id] ? parseInt(layout[tile.id].w)*this.colwidth -50 : 600} 
                    height={layout[tile.id] ? parseInt(layout[tile.id].h)*this.rowHeight: 400} 
                >
                </Chart>
            </Element>
        )
    }
    
    createTextTile(tile) {
        let channels = this.state.textChannels.filter( (c) => {return c.tile === tile.id });
        
        return (
            <Element key={"text" + tile.id} id={"text" + tile.id}>
                <TextOutput
                    id={tile.id}
                    key={tile.id}
                    textChannels={channels}
                    removeChannel={this.removeChannel}
                    colorChanged={this.update_channel_color}
                    togglePauseChannel={this.togglePauseChannel}
                    tileIDs={this.state.textTiles.map( (tile) => {return tile.id})}
                >
                </TextOutput>
            </Element>
        )
    }
    
    removeChannel(channelId) {
    
        let channel = this.channelMap[channelId];
        
        //Make sure channel already exists.
        if (!channel) {
            return;
        }
       
        let tiles = (channel.plottype === "text") ? this.state.textTiles : this.state.tiles;
        tiles.forEach( (t) => {
            if (channel.tile === t.id) {
                t.numChannels = t.numChannels-1;
            }
        });
        let newTiles = tiles.filter( (t) => {return t.numChannels !== 0});
        
        
        let channels = this.state.channels.filter( (c) => {return c.id !== channel.id });
        
        if (channel.plottype === "text") {
            this.setState( {
                textChannels: channels,
                textTiles: newTiles
            });    
        } else {
            this.setState( {
                channels: channels,
                tiles: newTiles
            });
        }
        let connection = channel.connection;
        this.connectionMap[connection] = this.connectionMap[connection].filter( (c) => { return c.id !== channel.id})
        
        if (this.connectionMap[connection].length === 0) {
            this.socket.emit("remove_connection", channel.connection );
        }
    
    }
    
    addSimpleChannel(connection, plottype, color, tileId) {
        //console.log("Add channel pressed");
        
        if (connection.indexOf(":") === -1) {
            connection = "rsb:" + connection;
        }
        
        const tiles = (plottype  === "text") ? this.state.textTiles : this.state.tiles;
        const tileCounter = (plottype  === "text") ? this.state.textTileCounter : this.state.tileCounter;
        const channels = (plottype  === "text") ? this.state.textChannels : this.state.channels;
        
        let newTiles, newTileCounter;
        if (tileId === "new") {
            tileId = tileCounter;
            newTiles = tiles.concat([{
                id: tileCounter, 
                numChannels: 1}])
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
        
        var key;
        switch (plottype) {
            case "line":
                key = "y";
                break;
            case "bar":
                key = "dist";
                break;
            case "text":
                key = "txt";
                break;
            default:
                console.log("Invalid plottype: ", plottype);
        }
        
        var newChannel = {
                    id: this.state.channelCounter, //plottype + "_" + channels.length,
                    key: key,
                    connection: connection,
                    plottype: plottype,
                    tile: Number(tileId),
                    color: color,
                    data: [],
                    mark: null,
                    markSize: 5}
                    
        this.channelMap[newChannel.id] = newChannel;
        if (this.connectionMap[connection]) {
            this.connectionMap[connection].push(newChannel);
        } else {
            this.connectionMap[connection] = [newChannel];
        }
        
        let newChannels = channels.concat([newChannel]);
                    
        if (plottype  === "text") {
            this.setState( {
                textTiles: newTiles,
                textTileCounter: newTileCounter,
                textChannels: newChannels,
                channelCounter: this.state.channelCounter + 1,
                });
        } else {
            this.setState( {
                tiles: newTiles,
                tileCounter: newTileCounter,
                channels: newChannels,
                channelCounter: this.state.channelCounter + 1,
                });
        
        }
        this.socket.emit("add_connection", connection);
        //TODO Trigger and handle incorrect connection specifications!
    }


    onLayoutChange(newLayout) {
        console.log("new layout: ", newLayout);
        this.setState({
            layout: newLayout
        })
    }
  
    render() {
  
        let {children} = this.props;
  
        let tiles = this.state.tiles;
        let textTiles = this.state.textTiles;
        let advancedChannels = this.connectionMap[this.probingConnection] ? this.connectionMap[this.probingConnection].slice() : [];

        let width = window.innerWidth*0.95;
        let cols = Math.floor(width/this.colwidth);
        
        //console.log("master render, advancedChannels: ", advancedChannels);
        return (
            <div>
                <div className="header">
                    {/* <div className="title">
                        <h1> {this.state.title} </h1>
                    </div> */}
                    <div className="ctrl">
                        <ChannelCtrl 
                            addSimpleChannel={this.addSimpleChannel} 
                            changePlottype={this.selectPlottype}
                            probeConnection={this.probeConnection}
                            tiles={this.state.textPlottype ? this.state.textTiles : this.state.tiles}
                            probeMessage={this.state.probeMessage}
                            advancedChannels={advancedChannels}          
                            addNewChannel={this.addNewChannel}     
                            updateChannel={this.updateChannel} 
                            removeChannel={this.removeChannel}
                            layout={this.state.layout}
                            layoutLoaded={this.layoutLoaded}
                        />
                    </div>
                 </div>
                 {children}
                 <GridLayout className="layout" layout={this.state.layout} 
                            cols={cols} 
                            rowHeight={this.rowHeight} 
                            width={width} 
                            draggableHandle=".element_handle"
                            onLayoutChange={this.onLayoutChange}
                            >
                    {tiles.map(this.createTile)}
                    {textTiles.map(this.createTextTile)}
                </GridLayout>
                 {/* <div className="tile-board">
                    
                 </div>
                 <div className="TextTile-board">
                    
                 </div> */}
                 
                 
            </div>  
    );
  }
}