import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import io from "socket.io-client";


import {XYPlot, XAxis, YAxis, LineSeries,VerticalBarSeries, VerticalBarSeriesCanvas, LineSeriesCanvas, AbstractSeries} from "react-vis";

//import * as V from 'victory';

import './index.css';


class Channel extends AbstractSeries {

    /*TODO: Currently channel components do not update the VictoryChart domain! */

    constructor(props) {
        super(props);
        this.state = {
                    data: []
                    };
    }


    componentWillReceiveProps(nextProps) {
      if (nextProps.nextDatum) {
          let data = this.state.data.slice();
          //data.push(nextProps.nextDatum);
          data.push({"x": data.length, "y": nextProps.nextDatum});
          this.setState( {
              data: data
          });
      }
      
      return true;
    }

    render() {
        console.log("Rendering channel: ", this.props.id);
        let {plottype, color} = this.props
                
        if (plottype === "line") {
            return (
                
                    <LineSeries data={this.state.data} />
                    
                
               
              
            )
        } else if (plottype === "bar") {
            return 
        } else {
            console.warn("Unknown plottype: ", plottype)
        }
        
    }
}

Channel.displayName = 'Channel';

class Chart extends Component {

    constructor(props) {
        super(props);
        this.state = {
                    data: [],
                    svg: false
                    };
    }
    
   /* 
    componentWillReceiveProps(nextProps) {
        console.log("chart got new props: ", nextProps);
      if (nextProps.channels[0].nextDatum) {
          let data = this.state.data.slice();
          //data.push(nextProps.nextDatum);
          data.push({"x": data.length, "y": nextProps.channels[0].nextDatum});
          this.setState( {
              data: data
          });
      }
      
      return true;
    }
    */
    
    createChannels(channels) {
        //console.log("channels: ", channels);
        return channels.map( (c) => {
        
            if (c.plottype == "line") {
                if (this.state.svg) {
                    return <LineSeries data={c.data} stroke={c.color}/>
                } else {
                    return <LineSeriesCanvas data={c.data} stroke={c.color}/>
                }
                
            } else if (c.plottype == "bar" ) {
                if (this.state.svg) {
                    console.log("bardata: ", c.data);
                    return <VerticalBarSeries  data={c.data} />
                } else {
                    return <VerticalBarSeriesCanvas data={c.data} />
                }
                
            }
        
        });
    
    }
    
    render() {
        
        let {id, channels} = this.props;
        return (
            <div className="tile">
                {id}
                <XYPlot height={300} width={600} dontCheckIfEmpty={false} >
                    <XAxis />
                    <YAxis />
                    {this.createChannels(channels)}
                    
                </XYPlot>
                <button onClick={() => this.props.removeChannel(this.props.id)} >
                    Remove Channel
                </button>
            </div>
    );
  }

}

Chart.propTypes = {
    plottype:   PropTypes.string
}

Chart.defaultProps = {

    plottype:   "line",
    channel:    "",
    nextDatum:  null,
    color: "black"
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
                Channel: <input type="text" id="channel"/>
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
        
        
    
    }
    
    componentDidMount() {
        this.socket = io.connect("http://localhost:5002");
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.update_data);
    }
    
    update_data(msg) {
        let channel = msg.channel;
        let payload = msg.y;
        let channels = this.state.channels.slice();
        channels.forEach( (c) => {
            if (c.id === channel) {
                if (c.plottype == "line") {
                    c.nextDatum = payload[0];
                    c.data.push({"x":c.data.length, "y":payload[0]});
                } else if (c.plottype == "bar") {
                    let chars = ["a","b","c","d","e","f"]
                    c.data = msg.dist.map( (v, i) => { return {"x":chars[i], "y":v}});
                }
            } 
        });
        this.setState({
            channels: channels
        })
    }
    
    createTile(tile) {
        let channels = this.state.channels.filter( (c) => {return c.tile == tile.id });
      //  console.log("Channels: ", this.state.channels);
        return (
            <Chart 
                id={tile.id}
                key={tile.id}
                removeChannel={this.removeChannel} 
                channels={channels}
            >
            </Chart>
        )
    }
    
    removeChannel(tileId) {
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
      //  console.log("Add channel pressed");
        let channel = document.getElementById("channel").value;
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
                channel: channel }])
            newTileCounter = tileCounter+1;
        } else {
            newTiles = tiles;
            newTileCounter = tileCounter;
        }
        
        let newChannels = channels.concat([{
                    id: channel,
                    plottype: plottype,
                    tile: tileId,
                    color: color,
                    nextDatum: null,
                    data: [] }]);
                    
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
