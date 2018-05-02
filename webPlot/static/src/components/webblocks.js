import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import CanvasComponent from "./gridworld.js";
import Element from "./element.js";
import CustomSlider from "./slider.js";
import ConditionSelection from "./conditionSelection.js"


import map from "../map.js";

export default class Webblocks extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stepNr : 0,
        }

        this.onSliderChange = this.onSliderChange.bind(this);
    }
    componentDidMount() {
        this.socket = io.connect("http://localhost:5000", {transport:["websocket"]});
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.update_data);
    }

    onSliderChange(value) {
        console.log("New slider value: ", value);
        this.setState({stepNr: value})
        // this.socket.emit("slider_changed", value);
    }

    onConditionSelect(selection) {
        console.log("Selected: ", selection);
    }

    render() {

        let {stepNr} = this.state;


        const agentPos = [[3,3], [5,5], [3,10], [7,2], [4,8]];

        return(
            <div className="webblocks-container">
                <Element>
                    {/* All the finished conditions */}
                    <ConditionSelection onSelect={this.onConditionSelect} />
                </Element>
                <Element>
                    <CanvasComponent bgname={"bg"} fgname={"fg"} width={600} height={400} map={map} pos={agentPos[stepNr % 5]}/>
                </Element>
                <Element>
                    <CustomSlider value={stepNr} onSliderChange={this.onSliderChange}/>
                </Element>
            </div>
        )

    }

}