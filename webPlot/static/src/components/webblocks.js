import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import CanvasComponent from "./gridworld.js";
import Element from "./element.js";
import CustomSlider from "./slider.js";
import ConditionSelection from "./conditionSelection.js"
import Text from "./textplot.js"

import map from "../map.js";


// import { Resizable, ResizableBox } from 'react-resizable';

import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';

export default class Webblocks extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stepNr : 0,
        }

        this.onSliderChange = this.onSliderChange.bind(this);
        this.onConditionSelect = this.onConditionSelect.bind(this);
        this.update_data = this.update_data.bind(this);
        this.reduceStepNr = this.reduceStepNr.bind(this);
        this.increaseStepNr = this.increaseStepNr.bind(this);
        this.replay = this.replay.bind(this);

        this.onLayoutChange = this.onLayoutChange.bind(this);


        this.curLayout = [
            {i: "sel", x:0, y:0, w: 5, h: 5},
            {i: "grid", x:0, y:3, w: 3, h: 10},
            {i: "slider", x:3, y:4, w: 2, h: 2},
            {i: "text", x:3, y:3, w: 2, h: 1},
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
        console.log("received data: ", data);
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
                samples: data.runData.sampleList
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
    }

    onSliderChange(value) {
        console.log("New slider value: ", value);
        this.setState({stepNr: value})
        // this.socket.emit("slider_changed", value);
    }

    onConditionSelect(condition, runNr) {
        console.log("Selected: ", condition, runNr);
        let conditionSrc = this.conditionSrc;
        this.conditionName = condition;
        this.selectedConditionRun = runNr;
        this.socket.emit("message", conditionSrc, JSON.stringify({"selection": {"condition": condition, "runNr": runNr}}))
    }

    reduceStepNr(){
        this.setState({
            stepNr: this.state.stepNr > 0 ? this.state.stepNr-1 : 0
        })
    }

    increaseStepNr(){
        this.setState({
            stepNr: this.state.stepNr < this.state.agentPositions.length-1 ? this.state.stepNr+1 : this.state.agentPositions.length-1
        })
    }

    replay() {
        // this.socket.emit("replay_condition", this.conditionName, this.selectedConditionRun);
        this.socket.emit("message", this.conditionSrc, 
                            JSON.stringify({"replay": {"condition": this.conditionName, 
                            "runNr": this.selectedConditionRun, 
                            "startStep": 0, //this.state.stepNr
                            "showVision": true,
                            "speedup": 2}}));
    }

    // pause() {
    //     this.socket.emit("message", conditionSrc, JSON.stringify({"pause": ""}));
    // }


    onLayoutChange(newLayout) {
        // TODO Allow saving the current layout
        this.curLayout = newLayout;
    }

    render() {

        let {stepNr, map, agentPositions, samples} = this.state;


        return(
            // <div className="webblocks-container">
                <GridLayout className="layout" layout={this.curLayout} cols={5} 
                            rowHeight={50} width={1400} 
                            draggableHandle=".element_handle"
                            onLayoutChange={this.onLayoutChange}>
                <Element key="sel" id="sel">
                    {/* All the finished conditions */}
                    {this.state.conditions ? <ConditionSelection onSelect={this.onConditionSelect} conditions={this.state.conditions}/>: ""}
                </Element>
                 <Element key="grid" id="grid">
                    {map ? <CanvasComponent conditionName={this.conditionName} 
                                            bgname={"bg"} 
                                            fgname={"fg"} 
                                            width={600} 
                                            height={400} 
                                            map={map} 
                                            pos={agentPositions[stepNr]}
                                            beliefs={samples[stepNr][1]}/> : ""}
                </Element>
                <Element key="slider" id="slider">
                    {agentPositions ? <div>
                                        <button onClick={this.reduceStepNr} >{"<"}</button>
                                        <button onClick={this.increaseStepNr} >{">"}</button>
                                        <button onClick={this.replay} >Replay</button>
                                        <CustomSlider value={stepNr} min={0} max={agentPositions.length-1} onSliderChange={this.onSliderChange}/>
                                    </div>: ""}
                </Element>
                <Element key="text" id="text">
                    {samples ? <Text data={samples[stepNr]}/> : ""}
                </Element>
                </GridLayout>
            // </div>
        )

    }

}