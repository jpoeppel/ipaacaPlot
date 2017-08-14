import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import LineChart from './components/line';
import BarChart from './components/bar';
import './index.css';


class Tile extends Component {

    constructor(props) {
        super(props);
        
        if (props.plottype === "line") {
            this.state = {
                    data: [[5,10,1,3,6,20,0],
                          [1,6,2,10,23,43]]
                }
        
        } else {
            this.state = {
                data: [
                        {key: "A", val: 0.5},
                        {key: "B", val: 0.25},
                        {key: "C", val: 1.5},
                        {key: "D", val: 0.5},
                        {key: "E", val: 0},
                      ]
            }
        }
    }
    
    render() {
        
        let {plottype, channel} = this.props;
    
        let tile = (plottype) => {
        
            if (plottype === "line") {
                return (
                    <LineChart data={this.state.data}
                    />
                )
            } else if (plottype === "bar") {
                return (
                    <BarChart data={this.state.data} 
                     />
                )
            } else {
                console.warn("Unknown plottype: ", plottype)
            }
        };
    
        return (
            <div className="tile">
                {channel}
                {tile(plottype)}
                <button onClick={() => this.props.removeChannel(this.props.id)} >
                    Remove Channel
                </button>
                <button onClick={() => this.addData()} >
                    Add Data
                </button>
            </div>
    );
  }
  
  addData() {
     console.log("Add data");
     if (this.props.plottype === "line") {
            let data = this.state.data.slice();
            let randint = Math.floor(Math.random() * (70));
            console.log("Adding: ", randint);
            data[0].push(randint);
            this.setState({
                    data: data
                });
        
        } else {
            this.setState({
                data: [
                        {key: "A", val: Math.random()},
                        {key: "B", val: Math.random()},
                        {key: "C", val: Math.random()},
                        {key: "D", val: Math.random()},
                        {key: "E", val: Math.random()},
                      ]
            });
        }
  }
  

}

Tile.propTypes = {
    plottype:   PropTypes.string
}

Tile.defaultProps = {

    plottype:   "line",
    channel:    ""
}


class ChannelCtrl extends Component {


    render() {
        return (
            <div>
                Channel: <input type="text" id="channel"/>
                Plottype: <select id="plottype">
                            <option value="line">Lineplot</option>
                            <option value="bar">Barplot</option>
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
            tiles: [{id: 0, type: "line", channel: "test"}, 
                    {id: 1, type: "bar", channel: "test"}],
            tileCounter: 2
        };
        
        this.addChannel = this.addChannel.bind(this);
        this.removeChannel = this.removeChannel.bind(this);
        this.createTile = this.createTile.bind(this);
    }
    
    createTile(tile, index) {
        return (
            <Tile 
                channel={tile.channel} 
                plottype={tile.type} 
                id={tile.id}
                key={tile.id}
                removeChannel={this.removeChannel} 
            />
        )
    }
    
    removeChannel(tileId) {
        console.log("Remove channel clicked: ", tileId);
        let tiles = this.state.tiles;
        
        var toRem = -1;
        for (var i=0; i<tiles.length; i++) {
            if (tiles[i].id === tileId) {
                toRem = i;
                break;
            }
        }
        if (toRem > -1) {
            tiles.splice(toRem, 1);
        }
        
        console.log("new tiles: ", toRem);
        this.setState( {
            tiles: tiles
        });
    
    }
    
    addChannel() {
        console.log("Add channel pressed");
        let channel = document.getElementById("channel").value;
        let plottype = document.getElementById("plottype").value;
        console.log("Selected channel: ", channel);
        console.log("Selected channel: ", plottype);
        
        const tiles = this.state.tiles;
        const tileCounter = this.state.tileCounter;
        
        this.setState( {
            tiles: tiles.concat([{
                id: tileCounter, 
                type: plottype, 
                channel: channel }]),
            tileCounter: tileCounter+1
            });
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
