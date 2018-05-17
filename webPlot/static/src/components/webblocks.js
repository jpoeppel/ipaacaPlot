import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import CanvasComponent from "./gridworld.js";
import Element from "./element.js";
import CustomSlider from "./slider.js";
import ConditionSelection from "./conditionSelection.js"
import Text from "./textplot.js"
import Chart from "./chart.js"

import map from "../map.js";


// import { Resizable, ResizableBox } from 'react-resizable';

import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import {FlexibleWidthXYPlot, XAxis, YAxis, Borders,
    LineSeries, LineSeriesCanvas, 
    VerticalBarSeries, VerticalBarSeriesCanvas, 
    CustomSVGSeries, DiscreteColorLegend} from "react-vis"; // ./3rdParty/

export default class Webblocks extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stepNr : 0,
            visibleList : []
        }

        this.onSliderChange = this.onSliderChange.bind(this);
        this.onConditionSelect = this.onConditionSelect.bind(this);
        this.update_data = this.update_data.bind(this);
        this.reduceStepNr = this.reduceStepNr.bind(this);
        this.increaseStepNr = this.increaseStepNr.bind(this);
        this.replay = this.replay.bind(this);
        this.requestVisibles = this.requestVisibles.bind(this);

        this.onLayoutChange = this.onLayoutChange.bind(this);

        this.onWheel = this.onWheel.bind(this);


        // this.curLayout = [
        //     {i: "sel", x:0, y:0, w: 5, h: 5},
        //     {i: "gridAgentsBelief", x:0, y:3, w: 3, h: 10},
        //     {i: "gridGroundTruth", x:0, y:3, w: 3, h: 10},
        //     {i: "slider", x:3, y:4, w: 2, h: 2},
        //     {i: "text", x:3, y:3, w: 2, h: 1},
        //     {i: "ratings", x:3, y:5, w: 2, h: 1},
        // ];

        this.curLayout = [ 
            { "i": "sel", "w": 20, "h": 5, "x": 0, "y": 0 },
            { "i": "gridGroundTruth", "w": 7, "h": 10, "x": 0, "y": 5},
            { "i": "gridAgentsBelief", "w": 7, "h": 10, "x": 7, "y": 5},
            { "i": "slider", "w": 6, "h": 2, "x": 14, "y": 6},
            { "i": "text", "w": 6, "h": 1, "x": 14, "y": 5},
            { "i": "ratings", "w": 6, "h": 7, "x": 14, "y": 8}
          ];
    }

    componentDidMount() {
        this.socket = io.connect("http://localhost:5000", {transport:["websocket"]});
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.update_data);
    }


    update_data(data) {
        // console.log("received data: ", data);
        if (data.conditions) {
            this.setState({
                conditions: data.conditions
            })
            this.conditionSrc = data.connection;
        }
        if (data.runData) {
            this.setState({
                map: {"map": data.runData.map, "targets": data.runData.targets, "goalPos": data.runData.goalPos},
                agentPositions: data.runData.agentPositions,
                stepNr: 0,
                samples: data.runData.sampleList,
                ratingsSamples: data.runData.ratingListSamples,
                ratingsM1: data.runData.ratingListM1,
                ratingsM2: data.runData.ratingListM2,
                ratingsM3: data.runData.ratingListM3,
                ratingsM4: data.runData.ratingListM4
            })
        }

        if (data.position_update) {
            let newPos = data.position_update.pos;
            let idx = data.position_update.idx;

            let newPositions = this.state.agentPositions.slice();
            newPositions[idx] = newPos;

            this.setState({
                agentPositions: newPositions,
                stepNr: idx
            })
        }

        if (data.visibles) {
            console.log("Visible list: ", data.visibles)
            this.setState({
                visibleList: data.visibles
            })
        }
    }

    onSliderChange(value) {
        this.setState({stepNr: value})
        this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            playBtn.innerText = "Replay";
        }
    }

    onConditionSelect(condition, runNr) {
        let conditionSrc = this.conditionSrc;
        this.conditionName = condition;
        this.selectedConditionRun = runNr;
        this.socket.emit("message", conditionSrc, JSON.stringify({"selection": {"condition": condition, "runNr": runNr}}));
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            playBtn.innerText = "Replay";
        }
    }

    reduceStepNr(){
        this.setState({
            stepNr: this.state.stepNr > 0 ? this.state.stepNr-1 : 0
        })
        this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            playBtn.innerText = "Replay";
        }
    }

    increaseStepNr(){
        this.setState({
            stepNr: this.state.stepNr < this.state.agentPositions.length-1 ? this.state.stepNr+1 : this.state.agentPositions.length-1
        })
        this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            playBtn.innerText = "Replay";
        }
    }

    replay(event) {
        // this.socket.emit("replay_condition", this.conditionName, this.selectedConditionRun);

        // if (event.target)
        if (event.target.innerText === "Replay") {
            this.socket.emit("message", this.conditionSrc, 
                            JSON.stringify({"replay": {"condition": this.conditionName, 
                            "runNr": this.selectedConditionRun, 
                            "startStep": this.state.stepNr,
                            "showVision": true,
                            "speedup": 2}}));
            event.target.innerText = "Pause";
        } else {
            this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
            event.target.innerText = "Replay";
        }
    }

    // pause() {
    //     this.socket.emit("message", conditionSrc, JSON.stringify({"pause": ""}));
    // }


    onLayoutChange(newLayout) {
        // TODO Allow saving the current layout
        this.curLayout = newLayout;
        console.log("new layout: ", newLayout);
    }

    requestVisibles() {
        this.socket.emit("message", this.conditionSrc,
                        JSON.stringify({"visibles": {"condition": this.conditionName, 
                        "runNr": this.selectedConditionRun}}) )
    }



  onWheel(e) {
    if (e.deltaY < 0) {
        this.increaseStepNr();
    } else {
        this.reduceStepNr();
    }
  }

    render() {

        let {stepNr, map, agentPositions, samples, ratingsSamples, ratingsM1, ratingsM2, ratingsM3, ratingsM4} = this.state;
        // if (ratings) {
        // var ratingObjects = 
        // })
        // }   
        return(
            // <div className="webblocks-container">
                <GridLayout className="layout" layout={this.curLayout} cols={20} 
                            rowHeight={50} width={1800} 
                            draggableHandle=".element_handle"
                            onLayoutChange={this.onLayoutChange}>
                <Element key="sel" id="sel">
                    {/* All the finished conditions */}
                    {this.state.conditions ? <ConditionSelection onSelect={this.onConditionSelect} conditions={this.state.conditions}/>: ""}
                </Element>
                <Element key="gridGroundTruth" id="gridGroundTruth">
                    {map ? <CanvasComponent conditionName={this.conditionName} 
                                            bgname={"bg"} 
                                            fgname={"fg"} 
                                            width={600} 
                                            height={400} 
                                            map={map} 
                                            pos={agentPositions[stepNr]}
                                            traj={agentPositions.slice(0, stepNr)}
                                            // beliefs={samples[stepNr][1]}
                                            requestVisibles={this.requestVisibles}
                                            visibles={this.state.visibleList[stepNr]}
                                            /> : ""}
                </Element>
                 <Element key="gridAgentsBelief" id="gridAgentsBelief">
                    {map ? <CanvasComponent conditionName={this.conditionName} 
                                            bgname={"bg"} 
                                            fgname={"fg"} 
                                            width={600} 
                                            height={400} 
                                            map={map} 
                                            pos={agentPositions[stepNr]}
                                            traj={agentPositions.slice(0, stepNr+1)}
                                            beliefs={samples[stepNr][1]}
                                            requestVisibles={this.requestVisibles}
                                            visibles={this.state.visibleList[stepNr]}
                                            /> : ""}
                </Element>
                <Element key="slider" id="slider">
                    {agentPositions ? <div onWheel={this.onWheel}>
                                        <button onClick={this.reduceStepNr} >{"<"}</button>
                                        <button onClick={this.increaseStepNr} >{">"}</button>
                                        <button id="togglePlay" onClick={this.replay} >Replay</button>
                                        <CustomSlider value={stepNr} min={0} max={agentPositions.length-1} onSliderChange={this.onSliderChange}/>
                                        
                                    </div>: ""}
                   
                </Element>
                <Element key="text" id="text">
                    {samples ? <Text data={samples[stepNr]}/> : ""}
                </Element>
                <Element key="ratings" id="ratings">
                    {ratingsSamples ? <FlexibleWidthXYPlot height={400} width={600}
                        dontCheckIfEmpty={true}
                        margin={{"left": 60, "right": 100}}>
                    <LineSeries data={ratingsSamples.map((el, i) => {
                        if (i > stepNr) {return []}
                        return {"x": i, "y": el}})} stroke={"red"} />
                    <LineSeries data={ratingsM1.map((el, i) => {
                        if (i > stepNr) {return []}
                        return {"x": i, "y": el}})} stroke={"blue"} />
                    <LineSeries data={ratingsM2.map((el, i) => {
                        if (i > stepNr) {return []}
                        return {"x": i, "y": el}})} stroke={"green"} />
                    <LineSeries data={ratingsM3.map((el, i) => {
                        if (i > stepNr) {return []}
                        return {"x": i, "y": el}})} stroke={"yellow"} />
                    <LineSeries data={ratingsM4.map((el, i) => {
                        if (i > stepNr) {return []}
                        return {"x": i, "y": el}})} stroke={"black"} />
                    <Borders style={{
                    bottom: {fill: '#fff'},
                    left: {fill: '#fff'},
                    right: {fill: '#fff'},
                    top: {fill: '#fff'}
                  }}/>
                    <XAxis />
                    <YAxis />
                    
                </FlexibleWidthXYPlot> : ""}
                <DiscreteColorLegend
                    orientation="horizontal"
                    height={50}
                    width={500}
                    items={[{"title": "sample", "color": "red"}, 
                            {"title": "TrueGoalWorld", "color": "blue"},
                            {"title": "TrueWorld", "color": "green"},
                            {"title": "TrueGoal", "color": "yellow"},
                            {"title": "NoAssumption", "color": "black"},]}
                />
                </Element>
                </GridLayout>
            // </div>
        )

    }

}