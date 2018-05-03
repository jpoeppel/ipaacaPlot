import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import CanvasComponent from "./gridworld.js";
import Element from "./element.js";
import CustomSlider from "./slider.js";
import ConditionSelection from "./conditionSelection.js"
import Text from "./textplot.js"

import map from "../map.js";

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

        this.conditionSrc = "zmq:5555";
        this.conditions = {"test1": 2, "test2": 3};

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
        this.socket.emit("select_condition", condition, runNr, conditionSrc)
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

    render() {

        let {stepNr, map, agentPositions, samples} = this.state;
        const agentPos = [[3,3], [5,5], [3,10], [7,2], [4,8]];



        return(
            <div className="webblocks-container">
                <Element>
                    {/* All the finished conditions */}
                    {this.state.conditions ? <ConditionSelection onSelect={this.onConditionSelect} conditions={this.state.conditions}/>: ""}
                </Element>
                <Element>
                    {map ? <CanvasComponent conditionName={this.conditionName} bgname={"bg"} fgname={"fg"} width={600} height={400} map={map} pos={agentPositions[stepNr]}/> : ""}
                </Element>
                <Element>
                    {agentPositions ? <div>
                                        <button onClick={this.reduceStepNr} >{"<"}</button>
                                        <button onClick={this.increaseStepNr} >{">"}</button>
                                        <CustomSlider value={stepNr} min={0} max={agentPositions.length-1} onSliderChange={this.onSliderChange}/>
                                    </div>: ""}
                </Element>
                <Element>
                    {samples ? <Text data={samples[stepNr]}/> : ""}
                </Element>
            </div>
        )

    }

}