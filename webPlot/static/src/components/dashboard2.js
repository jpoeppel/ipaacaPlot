import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import Chart from "./chart";
import TextOutput from "./textOutput";

import ChannelCtrl from "./channelCtrl";
import GridLayout from 'react-grid-layout';
import Element from "./element.js";

import {LinePlotStore, LinePlot, LinePlotInformation} from "./plots";

import ModuleConfiguration from "./moduleConfiguration";
import {SocketConnection, SocketConnectionStore} from "./io"

var modules = [{id: 1,
    name: "LinePlot",
    img: null},
    {id: 2,
    name: "BarPlot",
    img: null},
    {id: 3,
    name: "Gridworld",
    img: null}]


const mapIDToConfig = {1: LinePlotInformation}
const mapTypeToComponent = {"LinePlot": LinePlotStore}

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tiles: [],
            tileIDCounter: 0,
            layout: [],
            moduleConfig: null,
            colwidth: 100,
            rowHeight: 20
        };


        this.addModule = this.addModule.bind(this);
        this.createModule = this.createModule.bind(this);
        this.createTile = this.createTile.bind(this);
        
        // For Layout:
        this.onLayoutChange = this.onLayoutChange.bind(this);
        this.layoutLoaded = this.layoutLoaded.bind(this);
    }


    // componentDidMount() {
    //     this.socketConnection = new SocketConnection();
    // }

    addModule(moduleId) {
        console.log("Should add module: ", moduleId);
        console.log("New state: ", this.state);
        this.setState({
            moduleConfig: mapIDToConfig[moduleId]
        })

    }

    createModule(type, config) {
        console.log("Should create module: " + type + " with config: ", config);

        var newTiles = this.state.tiles;

        var newTile = {
            id: this.state.tileIDCounter,
            title: config.moduleConfig.title,
            type: type,
            dataSources: JSON.parse(JSON.stringify(config.dataConfig))
        }

        var newLayout = this.state.layout;
        newLayout.push({
            i: newTile.id,
            w: parseInt(config.moduleConfig.width),
            h: parseInt(config.moduleConfig.height),
            x: 0,
            y: 0
        })

        newTiles.push(newTile)
        this.setState({
            tiles: newTiles,
            layout: newLayout,
            tileIDCounter: newTile.id + 1, 
            moduleConfig: null
        })

        for (var dataSrc in config.dataConfig) {
            this.addConnection(config.dataConfig[dataSrc])
        }
    }

    layoutLoaded(newLayout) {
        this.setState({
            layout: newLayout
        })
    }

    onLayoutChange(newLayout) {
        console.log("new layout: ", newLayout);
        this.setState({
            layout: newLayout
        })
    }
    

    createTile(tile) {
        let Module = mapTypeToComponent[tile.type];

        let layout = this.state.layout;
        let colWidth = this.state.colWidth;
        let rowHeight = this.state.rowHeight;



        return(
            <Element key={tile.id} id={tile.id}>
                {/* <Module width={parseInt(layout[tile.id].w)*colWidth} 
                    height={parseInt(layout[tile.id].h)*rowHeight}
                    config={tile.dataSrc}/> */}
                <LinePlot/>
            </Element>
        )
    }
    
    
    render() {
  
        let {children} = this.props;
  
        let tiles = this.state.tiles;

        let width = window.innerWidth*0.95;
        let cols = Math.floor(width/this.colwidth);
        
        return (
            <div>
                <SocketConnectionStore addConnection={fn => this.addConnection = fn}
                                removeConnection={fn => this.removeConnection = fn} />
                <div className="header">
                    {this.state.header ? <div className="title">
                        <h1> {this.state.header} </h1>
                    </div> : ""}
                    <div className="ctrl">
                        <ChannelCtrl 
                            addSimpleChannel={this.addSimpleChannel} 
                            changePlottype={this.selectPlottype}
                            probeConnection={this.probeConnection}
                            tiles={tiles}
                            advancedChannels={[]}
                            probeMessage={this.state.probeMessage}
                            addNewChannel={this.addNewChannel}     
                            updateChannel={this.updateChannel} 
                            removeChannel={this.removeChannel}
                            layout={this.state.layout}
                            layoutLoaded={this.layoutLoaded}
                            header={this.state.header}
                            headerChanged={this.headerChanged}
                            modules={modules}
                            addModule={this.addModule}
                        />
                    </div>
                 </div>
                 {children}
                 {this.state.moduleConfig === null ? "": <ModuleConfiguration moduleInformation={this.state.moduleConfig} createModule={this.createModule}/>}
                 <GridLayout className="layout" layout={this.state.layout} 
                            cols={cols} 
                            rowHeight={this.rowHeight} 
                            width={width} 
                            draggableHandle=".element_handle"
                            onLayoutChange={this.onLayoutChange}
                            >
                    {tiles.map(this.createTile)}
                </GridLayout>
            </div>  
    );
  }
}