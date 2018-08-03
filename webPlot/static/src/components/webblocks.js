import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import io from "socket.io-client";


import CanvasComponent from "./gridworld.js";
import Element from "./element.js";
import CustomSlider from "./slider.js";
import ConditionSelection from "./conditionSelection.js"
import Text from "./textplot.js"
import ModelVis from "./modelVisualisation.js"


import {ConfigLoader, ConfigSaver}  from "./configIO.js"



import GridLayout from 'react-grid-layout';

import {FlexibleWidthXYPlot, XAxis, YAxis, Borders,
    LineSeries, LineSeriesCanvas, 
    VerticalBarSeries, VerticalBarSeriesCanvas, 
    CustomSVGSeries, DiscreteColorLegend, VerticalGridLines} from "react-vis"; // ./3rdParty/




export default class Webblocks extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stepNr : 0,
            visibleList : [],
            requests: {sampling: false,
                        twg: false,
                        tw: false,
                        tg: false,
                        na: false,
                        switching: false},
            runResults: {},
            layout: [
                {"w": 18,"h": 8,"x": 0,"y": 0,"i": "sel"},
                {"w": 6,"h": 18,"x": 0,"y": 4,"i": "gridGroundTruth"},
                {"w": 6,"h": 18,"x": 6,"y": 4,"i": "gridAgentsBelief"},
                {"w": 12,"h": 5,"x": 0,"y": 14,"i": "slider"},
                {"w": 6,"h": 2,"x": 12,"y": 4,"i": "text"},
                {"w": 6,"h": 3,"x": 12,"y": 5,"i": "Model selection"},
                {"w": 6,"h": 8,"x": 12,"y": 7,"i": "ratings"},
                {"w": 6,"h": 2,"x": 12,"y": 15,"i": "Options"},
                {"w": 5,"h": 7,"x": 0,"y": 16,"i": "Desire Beliefs"},
                {"w": 9,"h": 7,"x": 5,"y": 16,"i": "Goal Beliefs"},
                {"w": 3,"h": 7,"x": 14,"y": 16,"i": "World Beliefs"}
              ]
        }

        this.onSliderChange = this.onSliderChange.bind(this);
        this.onConditionSelect = this.onConditionSelect.bind(this);
        this.update_data = this.update_data.bind(this);
        this.reduceStepNr = this.reduceStepNr.bind(this);
        this.increaseStepNr = this.increaseStepNr.bind(this);
        this.replay = this.replay.bind(this);
        this.requestVisibles = this.requestVisibles.bind(this);

        this.onChangeRequestMethods = this.onChangeRequestMethods.bind(this);

        this.onLayoutChange = this.onLayoutChange.bind(this);
        this.layoutLoaded = this.layoutLoaded.bind(this);

        this.onWheel = this.onWheel.bind(this);

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

            let newRunResults = Object.assign({}, this.state.runResults);
            for (var key in data.runData.methodResults) {
                newRunResults[key] = data.runData.methodResults[key];
            }

            this.setState({
                map: {"map": data.runData.map, "targets": data.runData.targets, "goalPos": data.runData.goalPos},
                agentPositions: data.runData.agentPositions,
                stepNr: 0,
                runResults: newRunResults, 
                visibleList: [],
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
            this.setState({
                visibleList: data.visibles
            })
        }
    }

    onSliderChange(value) {
        this.setState({stepNr: value})
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            if (playBtn.innerText === "Pause") {
                this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
                playBtn.innerText = "Replay";
            }
        }
    }

    onConditionSelect(condition, runNr) {
        this.conditionName = condition;
        this.selectedConditionRun = runNr;
        this.socket.emit("message", this.conditionSrc, JSON.stringify({"selection": {"condition": condition, "runNr": runNr, "methods": this.state.requests}}));
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            playBtn.innerText = "Replay";
        }

        for (var key in this.state.requests) {
            if (!this.state.requests[key]) {
                this.state.runResults[key] = null;
            }
        }
    }

    reduceStepNr(){
        this.setState({
            stepNr: this.state.stepNr > 0 ? this.state.stepNr-1 : 0
        })
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            if (playBtn.innerText === "Pause") {
                this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
                playBtn.innerText = "Replay";
            }
        }
    }

    increaseStepNr(){
        this.setState({
            stepNr: this.state.stepNr < this.state.agentPositions.length-1 ? this.state.stepNr+1 : this.state.agentPositions.length-1
        })
        var playBtn = document.getElementById("togglePlay");
        if (playBtn) {
            if (playBtn.innerText === "Pause") {
                this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
                playBtn.innerText = "Replay";
            }
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
                            "speedup": 1}}));
            event.target.innerText = "Pause";
        } else {
            this.socket.emit("message", this.conditionSrc,
                            JSON.stringify({"pause": ""}));
            event.target.innerText = "Replay";
        }
    }



    onLayoutChange(newLayout) {
        // TODO Allow saving the current layout
        console.log("new layout: ", newLayout);
        this.setState({
            layout: newLayout
        })
    }

    requestVisibles() {
        if (this.state.visibleList.length === 0) {
        this.socket.emit("message", this.conditionSrc,
                        JSON.stringify({"visibles": {"condition": this.conditionName, 
                        "runNr": this.selectedConditionRun}}) )
        }
    }



    onWheel(e) {
        if (e.deltaY < 0) {
            this.increaseStepNr();
        } else {
            this.reduceStepNr();
        }
        e.preventDefault();
    }

    onChangeRequestMethods(e) {
        let method = e.target.id.slice(0,-5);
        let newRequests = Object.assign({}, this.state.requests);
        newRequests[method] = !newRequests[method];
 
        let a = {};
        a[method] = true;        

        if (newRequests[method] && !this.state.runResults[method] && this.conditionName && this.selectedConditionRun) {
            this.socket.emit("message", this.conditionSrc, JSON.stringify({"selection": {"condition": this.conditionName, 
                                                "runNr": this.selectedConditionRun, "methods": a}}));
        }

        this.setState({
            requests: newRequests
        })
    }

    layoutLoaded(newLayout) {
        this.setState({
            layout: newLayout
        })
    }

    render() {

        let {stepNr, map, agentPositions, requests, runResults} = this.state; //, samples, ratingsSamples, ratingsM1, ratingsM2, ratingsM3, ratingsM4} = this.state;
        // if (ratings) {
        // var ratingObjects = 
        // })
        // } 

        const colors = {"twg": "blue",
                        "tw": "orange",
                        "tg": "green",
                        "na": "purple",
                        "switching": "red",
                        "sampling": "yellow"}

        const strokes = {"twg": "",
                        "tw": "",
                        "tg": "",
                        "na": "",
                        "switching": "7 3",
                        "sampling": ""}

        let lines = [];
        for (var key in requests) {
            if (requests[key] && runResults[key]) {
                lines.push(<LineSeries key={key} data={runResults[key].ratingList.map((el, i) => {
                            if (i > stepNr) {return []}
                            return {"x": i, "y": el}})
                    } 
                    stroke={colors[key]} strokeDasharray={strokes[key]} />)
            }
        }

        let bars = [];
        for (var key in requests) {
            if (requests[key] && runResults[key]) {
                var bardata = []
                for (var desire in runResults[key].priorList[stepNr].desire) {
                    bardata.push({"x": desire, "y": runResults[key].priorList[stepNr].desire[desire]})
                }
                bars.push(<VerticalBarSeries key={key} data={bardata} color={colors[key]} />)
            }
        }

        let goal_bars = [];
        for (var key in requests) {
            if (requests[key] && runResults[key]) {
                var bardata = []
                for (var gb in runResults[key].priorList[stepNr].goal) {
                    bardata.push({"x": gb, "y": runResults[key].priorList[stepNr].goal[gb]})
                }
                goal_bars.push(<VerticalBarSeries key={key} data={bardata} color={colors[key]} />)
            }
        }

        let world_bars = [];
        for (var key in requests) {
            if (requests[key] && runResults[key]) {
                var bardata = []
                for (var wb in runResults[key].priorList[stepNr].world) {
                    bardata.push({"x": wb, "y": runResults[key].priorList[stepNr].world[wb]})
                }
                world_bars.push(<VerticalBarSeries key={key} data={bardata} color={colors[key]} />)
            }
        }

        let samples = runResults.sampling ? runResults.sampling.sampleList : null;


        const colwidth = 100;
        const rowHeight = 20;

        let width = window.innerWidth*0.85;
        let cols = Math.floor(width/colwidth);

        var curModel = null;

        var switchValues = [];
        if (runResults["switching"]) {
            curModel = runResults["switching"].modelList[stepNr];
            if (requests["switching"]) {
                // switchValues = runResults["switching"].reevaluationList;
                for (var i in runResults["switching"].reevaluationList) {
                    if (runResults["switching"].reevaluationList[i] <= stepNr) {
                        switchValues.push(runResults["switching"].reevaluationList[i]);
                    }
                }
            }
        }

        var w,h;

        var layout = {};

        for (var i in this.state.layout){
            var el = this.state.layout[i];
            layout[el.i] = el; 
            // if (el.i=="gridGroundTruth") {
                // w = parseInt(el.w);
                // h = parseInt(el.h);
            // }
        }

        let margin = [10,10];

        return(
            // <div className="webblocks-container">
                <GridLayout className="layout" layout={this.state.layout} 
                            cols={cols} 
                            rowHeight={rowHeight} 
                            width={width} 
                            draggableHandle=".element_handle"
                            onLayoutChange={this.onLayoutChange}>
                <Element key="sel" id="sel">
                    {/* All the finished conditions */}
                    {this.state.conditions ? <ConditionSelection onSelect={this.onConditionSelect} conditions={this.state.conditions}/>: ""}
                </Element>
                <Element key="gridGroundTruth" id="Observer's knowledge">
                    {map ? <CanvasComponent conditionName={this.conditionName} 
                                            bgname={"bg"} 
                                            fgname={"fg"} 
                                            width={layout["gridGroundTruth"] ? parseInt(layout["gridGroundTruth"].w)*colwidth : 600} 
                                            height={layout["gridGroundTruth"] ? (parseInt(layout["gridGroundTruth"].h))*(rowHeight+margin[1]) - margin[1]: 400}
                                            map={map} 
                                            pos={agentPositions[stepNr]}
                                            traj={agentPositions.slice(0, stepNr+1)}
                                            // beliefs={samples[stepNr][1]}
                                            requestVisibles={this.requestVisibles}
                                            visibles={this.state.visibleList[stepNr]}
                                            /> : ""}
                </Element>
                 <Element key="gridAgentsBelief" id="gridAgentsBelief">
                    {samples ? <CanvasComponent conditionName={this.conditionName} 
                                            bgname={"bg"} 
                                            fgname={"fg"} 
                                            width={layout["gridAgentsBelief"] ? parseInt(layout["gridAgentsBelief"].w)*colwidth : 600} 
                                            height={layout["gridGroundTruth"] ? (parseInt(layout["gridGroundTruth"].h))*(rowHeight+margin[1]) - margin[1]: 400}
                                            map={map} 
                                            pos={agentPositions[stepNr]}
                                            traj={agentPositions.slice(0, stepNr+1)}
                                            beliefs={samples[stepNr][1]}
                                            requestVisibles={this.requestVisibles}
                                            visibles={this.state.visibleList[stepNr]}
                                            /> : ""}
                </Element>
                <Element key="slider" id="Step">
                    {agentPositions ? <div onWheel={this.onWheel}>
                                        <CustomSlider value={stepNr} min={0} max={agentPositions.length-1} onSliderChange={this.onSliderChange}/>
                                        <div className={"slider-controls"} >
                                            <button onClick={this.reduceStepNr} >{"<"}</button>
                                            <button onClick={this.increaseStepNr} >{">"}</button>
                                            <button id="togglePlay" onClick={this.replay} >Replay</button>
                                        </div>
                                    </div>: ""}
                   
                </Element>
                <Element key="text" id="text">
                    {samples ? <Text data={samples[stepNr]}/> : ""}
                </Element>
                <Element key="Model selection" id="Model selection">
                    <div className={"flex"}>
                        <div>
                            Sampling:
                            <input id="samplingCheck" type="checkbox" defaultChecked={this.state.requests.sampling} checked={this.state.requests.sampling} onChange={this.onChangeRequestMethods} />
                        </div>
                        <div>
                            True Goal and World Belief:
                            <input id="twgCheck" type="checkbox" defaultChecked={this.state.requests.twg} checked={this.state.requests.tgw} onChange={this.onChangeRequestMethods} />
                        </div>
                        <div>
                            True World Belief:
                            <input id="twCheck" type="checkbox" defaultChecked={this.state.requests.tw} checked={this.state.requests.tw} onChange={this.onChangeRequestMethods} />
                        </div>
                        <div>
                            True Goal Belief:
                            <input id="tgCheck" type="checkbox" defaultChecked={this.state.requests.tg} checked={this.state.requests.tg} onChange={this.onChangeRequestMethods} />
                        </div>
                        <div>
                            No Assumption:
                            <input id="naCheck" type="checkbox" defaultChecked={this.state.requests.na} checked={this.state.requests.na} onChange={this.onChangeRequestMethods} />
                        </div>
                        <div>
                            Switching:
                            <input id="switchingCheck" type="checkbox" defaultChecked={this.state.requests.switching} checked={this.state.requests.switching} onChange={this.onChangeRequestMethods} />
                        </div>
                    </div>
                </Element>
                <Element key="ratings" id="Negative Log-Likelihood">
                    <DiscreteColorLegend
                    orientation="horizontal"
                    height={50}
                    items={[
                            // {"title": "sample", "color": colors["sampling"]}, 
                            {"title": "TrueGoalWorld", "color": colors["twg"]},
                            {"title": "TrueWorld", "color": colors["tw"]},
                            {"title": "TrueGoal", "color": colors["tg"]},
                            {"title": "NoAssumption", "color": colors["na"]},
                            {"title": "Switching", "color": colors["switching"]},
                            ]}
                    />
                    {lines.length > 0 ? <FlexibleWidthXYPlot 
                            width={layout["ratings"] ? parseInt(layout["ratings"].w)*colwidth : 600} 
                            height={layout["ratings"] ? parseInt(layout["ratings"].h)*rowHeight: 400} 
                            dontCheckIfEmpty={true}
                            margin={{"left": 60, "right": 30}}>
                            {lines}
                        <Borders style={{
                        bottom: {fill: '#fff'},
                        left: {fill: '#fff'},
                        right: {fill: '#fff'},
                        top: {fill: '#fff'}
                    }}/>
                        <XAxis />
                        <YAxis />
                        <VerticalGridLines tickValues={switchValues}/>
                        
                    </FlexibleWidthXYPlot> : ""}
                
                </Element>
                <Element key="Options" id="options">
                    <div className={"flex"}>
                        <ConfigLoader layoutLoaded={this.layoutLoaded}/>
                        <ConfigSaver layout={this.state.layout}/>
                    </div>
                </Element>
                <Element key="Desire Beliefs" id="Desire Beliefs">
                {bars.length > 0 ? <FlexibleWidthXYPlot 
                            width={layout["Desire Beliefs"] ? parseInt(layout["Desire Beliefs"].w)*colwidth : 600} 
                            height={layout["Desire Beliefs"] ? parseInt(layout["Desire Beliefs"].h)*rowHeight: 400} 
                            dontCheckIfEmpty={true}
                            margin={{"left": 60, "right": 100}}
                            xType={"ordinal"}
                            yDomain={[0,1]}
                            >
                            {bars}
                        <Borders style={{
                        bottom: {fill: '#fff'},
                        left: {fill: '#fff'},
                        right: {fill: '#fff'},
                        top: {fill: '#fff'}
                    }}/>
                        <XAxis />
                        <YAxis />
                        
                    </FlexibleWidthXYPlot> : ""}
                </Element>
                <Element key="Goal Beliefs" id="Goal Beliefs">
                {goal_bars.length > 0 ? <FlexibleWidthXYPlot 
                            width={layout["Goal Beliefs"] ? parseInt(layout["Goal Beliefs"].w)*colwidth : 600} 
                            height={layout["Goal Beliefs"] ? parseInt(layout["Goal Beliefs"].h)*rowHeight: 400} 
                            dontCheckIfEmpty={true}
                            margin={{"left": 60, "right": 100, "bottom":100}}
                            xType={"ordinal"}
                            yDomain={[0,1]}
                            >
                            {goal_bars}
                        <Borders style={{
                        bottom: {fill: '#fff'},
                        left: {fill: '#fff'},
                        right: {fill: '#fff'},
                        top: {fill: '#fff'}
                    }}/>
                        <XAxis tickLabelAngle={-90}/>
                        <YAxis />
                        
                    </FlexibleWidthXYPlot> : ""}
                </Element>
                <Element key="World Beliefs" id="World Beliefs">
                {world_bars.length > 0 ? <FlexibleWidthXYPlot 
                            width={layout["World Beliefs"] ? parseInt(layout["World Beliefs"].w)*colwidth : 600} 
                            height={layout["World Beliefs"] ? parseInt(layout["World Beliefs"].h)*rowHeight: 400} 
                            dontCheckIfEmpty={true}
                            margin={{"left": 60, "right": 100, "bottom":100}}
                            xType={"ordinal"}
                            yDomain={[0,1]}
                            >
                            {world_bars}
                        <Borders style={{
                        bottom: {fill: '#fff'},
                        left: {fill: '#fff'},
                        right: {fill: '#fff'},
                        top: {fill: '#fff'}
                    }}/>
                        <XAxis tickLabelAngle={-90}/>
                        <YAxis />
                        
                    </FlexibleWidthXYPlot> : ""}
                </Element>
                <Element key="Current model" id="Currently selected model">
                    <ModelVis curModel={curModel}/>
                </Element>

                </GridLayout>
            // </div>
        )

    }

}