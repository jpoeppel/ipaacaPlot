import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import CollapsibleCard from './collapsibleCard';
import TabView from "./tabView";

export default class ChannelCtrl extends PureComponent {

    constructor(props) {
        super(props)
        
        this.newChannel = this.newChannel.bind(this);
        this.addSimpleChannel = this.addSimpleChannel.bind(this);
        this.probeConnection = this.probeConnection.bind(this);
        this.createChannelSettings = this.createChannelSettings.bind(this);
        this.createSingleChannelSettings = this.createSingleChannelSettings.bind(this);
        
        this.activateChannel = this.activateChannel.bind(this);
    }
    
    activateChannel(e) {
        console.log("pressed button for channel: ", e.target.id);
        
        let connection = document.getElementById("connection").value;
        let channelId = e.target.id.split("_")[0];
        
        let key = document.getElementById(channelId+"_key").value;
        let plottype = document.getElementById(channelId+"_plottype").value;
        let color = document.getElementById(channelId+"_color").value;
        let tileId = document.getElementById(channelId+"_tile").value;
        
        this.props.updateChannel(connection, channelId, key, plottype, color, tileId);
    }
    
    
    newChannel() {
        let connection = document.getElementById("connection").value;
        this.props.addNewChannel(connection);
    }

    addSimpleChannel() {
        let channel = document.getElementById("channel").value;
        let plottype = document.getElementById("plottype").value;
        let color = document.getElementById("color").value;
        let tileId = document.getElementById("tile").value;
        this.props.addSimpleChannel(channel, plottype, color, tileId);
    }


    probeConnection() {
        let connection = document.getElementById("connection").value;
        this.props.probeConnection(connection);
    }
    
    
    
    createSingleChannelSettings(channel) {
        return (
            <div>
                Channel {channel.id}: 
                Key: <input type="text" id={channel.id + "_key"} defaultValue={channel.key}/>
                Plottype: <select id={channel.id + "_plottype"} onChange={this.props.changePlottype} 
                                defaultValue={channel.plottype ? channel.plottype : "line"}>
                            <option value="line">Lineplot</option>
                            <option value="bar">Barplot</option>
                            <option value="text">Text</option>
                          </select>     
                Color:  <input type="color" id={channel.id + "_color"} defaultValue={channel.color}/>
                Panel: <select id={channel.id + "_tile"} defaultValue={channel.tile >= 0 ? channel.tile : "new"}>
                                {this.options}
                            </select>
                
                <button id={channel.id + "_activateBtn"} onClick={this.activateChannel} >
                    Activate
                </button>
            </div>
        )    
    }
    
    createChannelSettings() {
    
        let channels = this.props.advancedChannels;
        return channels.map(this.createSingleChannelSettings);
    }
 
    render() {
    
        let tiles = this.props.tiles;
        
        let options = tiles.map( (tile) => {
                                    return <option value={tile.id}>{tile.id}</option>
                                });
        options = options.concat(<option value="new">New</option>);
    
        this.options = options;
        return (
            <CollapsibleCard title="Channel Control" expandedByDefault={true}>
                <TabView group="Simple">
                    <div name={"Simple"}>
                        Channel: <input type="text" id="channel" />
                        Plottype: <select id="plottype" onChange={this.props.changePlottype} >
                                    <option value="line">Lineplot</option>
                                    <option value="bar">Barplot</option>
                                    <option value="text">Text</option>
                                  </select>     
                        Color:  <input type="color" id="color" />
                        Add to panel: <select id="tile">
                                        {options}
                                    </select>
                        
                        <button onClick={this.addSimpleChannel} >
                            Add Channel
                        </button>
                    </div>
                    <div name={"Advanced"}>
                        Input connection: <input type="text" id="connection" /> 
                        <button onClick={this.probeConnection} >
                                Try listen
                        </button> 
                        <div>
                            {JSON.stringify(this.props.probeMessage)}
                        </div>
                        
                        
                        <div className="channelList">
                            Current Channels for this connection:
                            {this.createChannelSettings()}
                            <button onClick={this.newChannel} >
                                Add channel to this connection
                            </button> 
                        </div>
                        
                    </div>
                </TabView>
            </CollapsibleCard>

        )
    }
}

ChannelCtrl.propTypes = {
    tiles:          PropTypes.array,
    addChannel:     PropTypes.func
}