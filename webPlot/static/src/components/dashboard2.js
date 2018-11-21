import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import Chart from "./chart";
import TextOutput from "./textOutput";

import DashboardCtrl from "./dashboardCtrl";
import GridLayout from 'react-grid-layout';
import Element from "./element.js";
import ChartControls from "./chartControls";

import {LinePlotStore, LinePlotInformation, BarPlotInformation, BarPlotStore} from "./plots";
import {SliderInformation, CustomSliderStore} from "./slider";
import {CheckedTextStore, CheckedTextInformation} from './connectedCheckedData';

import ModuleConfiguration from "./moduleConfiguration";
import {SourceBlock} from "./moduleConfiguration";
import {updateState} from "../utils";
import {SocketConnectionStore} from "./io"

import { ExperimentViewInformation, ExperimentViewStore } from './experimentViewStore';

import lineThumb from '../img/linePlot.png'
import barThumb from '../img/barPlot.png'
import sliderThumb from '../img/slider.png'
import gridThumb from '../img/gridPlot.png'

var modules = [{id: 1,
    name: "LinePlot",
    img: lineThumb},
    {id: 2,
    name: "BarPlot",
    img: barThumb},
    {id: 3,
    name: "Gridworld",
    img: gridThumb},
    {id: 4,
    name: "Slider",
    img: sliderThumb},
    {id: 5,
    name: "ExperimentView",
    img: gridThumb},
    {id: 6,
    name: "CheckedText",
    img: null}
]


const mapIDToConfig = {1: LinePlotInformation, 2: BarPlotInformation, 4: SliderInformation, 5: ExperimentViewInformation, 6:CheckedTextInformation}
const mapTypeToComponent = {"LinePlot": LinePlotStore, "BarPlot": BarPlotStore, "Slider": CustomSliderStore, "ExperimentView": ExperimentViewStore, "CheckedText":CheckedTextStore}

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tiles: [],
            tileIDCounter: 0,
            layout: [{"i": "12", "w":4, "h":3, "x": 0, "y":0}],
            moduleConfig: null,
            colWidth: 100,
            rowHeight: 20
        };

        this.connectionMap = {};

        this.addModule = this.addModule.bind(this);
        this.closeConfig = this.closeConfig.bind(this);
        this.createModule = this.createModule.bind(this);
        this.createTile = this.createTile.bind(this);
        this.updateConfig = this.updateConfig.bind(this);
        
        // For Layout:
        this.onLayoutChange = this.onLayoutChange.bind(this);
        this.configLoaded = this.configLoaded.bind(this);
    }

    clearTiles() {
        for (var i=0;i<this.state.tiles.length;i++) {
            let tile = this.state.tiles[i];
            this.removeTile(tile.id);
        }
    }

    configLoaded(config) {

        this.clearTiles();

        console.log("loading config: ", config)

        for (var i=0; i<config.tiles.length;i++){

            let tile = config.tiles[i];
            let conf = tile.config;
            for (var dataSrc in conf.dataConfig) {
                let src = conf.dataConfig[dataSrc];
                if (this.connectionMap[src.channel]) {
                    //Add only if it does not already exist
                    if (this.connectionMap[src.channel].indexOf(tile.id) == -1) {
                        this.connectionMap[src.channel].push(tile.id);
                    }
                } else {
                    this.connectionMap[src.channel] = [tile.id];
                }
                this.addConnection(src);
            }
        }
        this.setState(config);
    }

    // componentDidMount() {
    //     this.socketConnection = new SocketConnection();
    // }

    closeConfig() {
        this.setState({
            moduleConfig: null
        })
    }

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
            config: JSON.parse(JSON.stringify(config)),
            // title: config.moduleConfig.title,
            type: type,
            // dataSources: JSON.parse(JSON.stringify(config.dataConfig))
        }

        var newLayout = this.state.layout;
        newLayout.push({
            i: newTile.id.toString(),
            w: parseInt(config.moduleConfig.width),
            h: parseInt(config.moduleConfig.height),
            x: 0,
            y: Infinity
        })

        newTiles.push(newTile)
        this.setState({
            tiles: newTiles,
            layout: newLayout,
            tileIDCounter: this.state.tileIDCounter + 1, 
            moduleConfig: null
        })

            console.log("adding tile dataconfig: ", config.dataConfig)
        for (var dataSrc in config.dataConfig) {
            console.log("adding Tile dataSrc: ", dataSrc)
            let src = config.dataConfig[dataSrc];
            if (this.connectionMap[src.channel]) {
                //Add only if it does not already exist
                if (this.connectionMap[src.channel].indexOf(newTile.id) == -1) {
                    this.connectionMap[src.channel].push(newTile.id);
                }
            } else {
                this.connectionMap[src.channel] = [newTile.id];
            }
            this.addConnection(src);
        }

        console.log("ConnectionMap after adding: ", this.connectionMap);
    }

    layoutLoaded(newLayout) {
        this.setState({
            layout: newLayout
        })
    }

    onLayoutChange(newLayout) {
        // console.log("new layout: ", newLayout);
        this.setState({
            layout: newLayout
        })
    }
    

    removeTile(tileId) {
        console.log("should remove tile: ", tileId)

        var removedTile = null;
        let newTiles = this.state.tiles.filter( t => {
            if (t.id !== tileId) {
                return t
            } else {
                removedTile = t;
            }
        })
        console.log("removedTile: ", removedTile)
        console.log("conmap before: ", this.connectionMap);
        for (var i=0;i<removedTile.config.dataConfig.length; i++) {
            let src = removedTile.config.dataConfig[i];
            let idx = this.connectionMap[src.channel].indexOf(removedTile.id);
            console.log("idx: ", idx);
            if (idx > -1) {
                this.connectionMap[src.channel].splice(idx, 1);
            }
            if (this.connectionMap[src.channel].length == 0) {
                this.removeConnection(src.channel, src.dataKeys)
            }
        }

        console.log("conmap after: ", this.connectionMap);

        let newLayout = this.state.layout.filter( l => {
            if (l.i !== tileId) {
                return l
            }
        })

        this.setState({
            layout: newLayout,
            tiles: newTiles
        })
    }

    updateConfig(tileID, e) {
        console.log("should update config for tile: ", tileID);
        console.log("event: ", e);

        let tilePos = this.state.tiles.findIndex( el => el.id === tileID);

        console.log("TilePos: ", tilePos);
        console.log("state slice: ", this.state.tiles[tilePos])
        

        let keys = e.target.id.split(".");
        console.log("keys: ", keys)
        let val = e.target.type === "checkbox" ? JSON.parse(e.target.checked) : e.target.value;
        let newTileState = updateState(this.state.tiles[tilePos].config, keys, val);
        let newTiles = this.state.tiles.slice();
        console.log("newTiles: ", newTiles)
        newTiles[tilePos].config = newTileState;
        this.setState({...this.state, tiles: newTiles});
    }

    removeDateSource() {
        console.log("remove data source");
    }


    createTab(tileID, name, contents, index="") {
        console.log("CreateTab for tile: ", tileID)
        console.log("contents: ", contents)
        let suffix = contents.name ? contents.name : "";
        let sourceID = name + (index !== "" ? "." + index : "");
        return(
            <div name={name + ": " + suffix} className={"vflex"}>
                {/* {elements} */}
                <SourceBlock id={sourceID} configOptions={contents} 
                                allowRemoval={false} 
                                updateValues={(e) => this.updateConfig(tileID,e)} 
                                removeDataSource={this.removeDateSource}
                    />
            </div>
        )
    }

    createDataSourceControl(tileID, config) {
        console.log("Create data source for tile: ", tileID)
        console.log("config: ", config);
        // let res = sources.map( (s,i) => {

        let blocks = []
        for (var confN in config) {
            let confObj = config[confN]
            if (Object.prototype.toString.call(confObj) == '[object Array]') {
                for (var i=0;i<confObj.length;i++) {
                    blocks.push(this.createTab(tileID, confN, confObj[i], i))
                }
            } else {
                let name = confN + ": " + (confObj.name ? confObj.name : "");
                blocks.push(this.createTab(tileID, confN, confObj))
            }
        }
        console.log("blocks: ", blocks);
        return blocks;
    }

    createTile(tile) {
        let Module = mapTypeToComponent[tile.type];

        let layout = this.state.layout.filter( el => {
            if (el.i == tile.id) {
                return el
            }
        })[0]
        let colWidth = this.state.colWidth;
        let rowHeight = this.state.rowHeight;
        let children = null;
        let createControls = null;
        return(
            <Element key={tile.id.toString()} id={tile.config.moduleConfig.title} data-grid={layout} >
                <Module width={parseInt(layout.w)*colWidth} 
                    height={parseInt(layout.h)*rowHeight}
                    config={tile.config}
                    // configCallback={fn => createControls = fn}
                />
                <ChartControls title={"Module settings"} group={"General"}>
                    <div name={"General"}>
                        <button onClick={ () => {this.removeTile(tile.id) } } >
                                Remove Module
                        </button>
                    </div>
                    {this.createDataSourceControl(tile.id, tile.config)}
                    {/* {children} */}
                </ChartControls>
            </Element>
        )
    }
    
    
    render() {
  
        let {children} = this.props;
  
        let tiles = this.state.tiles;

        let width = window.innerWidth*0.95;
        let cols = Math.floor(width/this.state.colWidth);
        
        return (
            <div>
                <SocketConnectionStore addConnection={fn => this.addConnection = fn}
                                removeConnection={fn => this.removeConnection = fn} />
                <div className="header">
                    {this.state.header ? <div className="title">
                        <h1> {this.state.header} </h1>
                    </div> : ""}
                    <div className="ctrl">
                        <DashboardCtrl 
                            addSimpleChannel={this.addSimpleChannel} 
                            changePlottype={this.selectPlottype}
                            probeConnection={this.probeConnection}
                            tiles={tiles}
                            advancedChannels={[]}
                            probeMessage={this.state.probeMessage}
                            addNewChannel={this.addNewChannel}     
                            updateChannel={this.updateChannel} 
                            removeChannel={this.removeChannel}
                            config={this.state}
                            configLoaded={this.configLoaded}
                            header={this.state.header}
                            headerChanged={this.headerChanged}
                            modules={modules}
                            addModule={this.addModule}
                        />
                    </div>
                 </div>
                 {children}
                 {this.state.moduleConfig === null ? "": <ModuleConfiguration moduleInformation={this.state.moduleConfig} 
                    createModule={this.createModule} 
                    closeConfig={this.closeConfig}/>}
                 <GridLayout className="layout" 
                            layout={this.state.layout} 
                            cols={cols} 
                            rowHeight={this.state.rowHeight} 
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