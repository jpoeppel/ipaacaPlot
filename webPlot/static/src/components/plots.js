import React, { PureComponent } from 'react';
import {connect} from 'react-redux';

import {FlexibleWidthXYPlot, XAxis, YAxis, Borders, 
    VerticalGridLines, LineSeries, VerticalBarSeries} from "react-vis"; // ./3rdParty/


// An object specifying the kind of information which is requested when creating
// a new LinePlot
export const LinePlotInformation = {
    type: "LinePlot", //mandatory
    dataSrc: {
        name: "0", //mandatory
        channel: "tcp:9080", //mandatory
        dataKeys: [{"name": "Payload key", "val": "y", "log": true}], //mandatory
        color: "black", //LinePlot specific
        strokes: "" //LinePlot specific
    },
    title: "LinePlot", //mandatory
    width: 10, //mandatory ?
    height: 6, //mandatory ?
    allowMultipleSources: true //mandatory ?
}

const LinePlotInformationTestNew = {
    type: "LinePlot",
    dataSrc: {
        name: {val: "0", type: "text", changable: true},
        channel: {val: "tcp:9080", type: "text", changable: false},
        dataKeys: [{name: "Payload key", val: "y", log: true}],
        color: {val: "black", type: "color", changable: true},
        strokes: {val: "", type: "text", changable: true}
    },
    title: "LinePlot",
    width: 10,
    height: 6,
    allowMultipleSources: true
}


function createLineSeries(channelState, stepNr, sourceProps) {
    let data = channelState.map((el, i) => {
        if (i > stepNr) {return []}
        return {"x": i, "y": el}
        })
    return <LineSeries key={sourceProps.dataKeys[0].val} 
                data={data} 
            stroke={sourceProps.color} strokeDasharray={sourceProps.strokes} />
}


function mapStateToPropsLines(state, ownProps) {
    let data = state.data
    let lines = [];
    let vlines = []
    let sources = ownProps.config.dataConfig;
    for (var id in sources) {
        let channelData = data.channels[sources[id].channel]
        if (channelData && channelData[sources[id].dataKeys[0].val]) { 
            lines.push(createLineSeries(channelData[sources[id].dataKeys[0].val], state.data.stepNr, sources[id])) //Assumes state.stepNr exists!
        } 
    }
    return {lines: lines, vlines: vlines}
}

class LinePlot extends PureComponent {

    // componentDidMount() {
    //     this.props.configCallback()
    // }

    render() {
        let {width, height, lines, vlines} = this.props;

        return(
            <FlexibleWidthXYPlot 
                width={width} 
                height={height} 
                dontCheckIfEmpty={true}
                margin={{"left": 60, "right": 30}}
                >
                {lines}
                <Borders style={{
                    bottom: {fill: '#fff'},
                    left: {fill: '#fff'},
                    right: {fill: '#fff'},
                    top: {fill: '#fff'}
                }}/>
                {lines.length > 0 ? <XAxis /> : null}
                {lines.length > 0 ? <YAxis /> : null}
            <VerticalGridLines tickValues={vlines}/>
        </FlexibleWidthXYPlot>
        )
    }
}

LinePlot.defaultProps = {
    width: 600,
    height: 400,
    lines: [],
    vlines: [],
  };

const LinePlotStore = connect(mapStateToPropsLines)(LinePlot);

export {LinePlotStore};


export const BarPlotInformation = {
    type: "BarPlot",
    dataSrc: {
        name: "0",
        channel: "tcp:9080",
        dataKeys: [{"name": "Payload key", "val": "dist", "log": false}],
        color: "black",
    },
    title: "BarPlot",
    width: 10,
    height: 6,
    allowMultipleSources: true
}

function createBarSeries(channelState, stepNr, sourceProps) {
    var bardata = []
    let data = channelState[sourceProps.dataKeys[0].val]
    let type = Object.prototype.toString.call(data) 

    if (stepNr) {
        // If stepNr is set, we are assuming to have a store of data objects
        data = data[stepNr]
    }

    if (type == '[object Array]') {
        bardata = data.map( (el,i) => {
            return {"x": el[0], "y": el[1]}
        })
    } else if (type == '[object Object]') {
        for (var key in data) {
            bardata.push({"x": key, "y": data[key]})
        }
    }

    return <VerticalBarSeries key={sourceProps.dataKeys[0].val} 
                             data={bardata} 
                             color={sourceProps.color} />
}

function mapStateToPropsBars(state, ownProps) {
    let data = state.data
    let bars = [];
    let sources = ownProps.config.dataConfig;
    for (var id in sources) {
        let channelData = data.channels[sources[id].channel];
        if (channelData && channelData[sources[id].dataKeys[0].val]) { 
            bars.push(createBarSeries(channelData, state.stepNr, sources[id])) //Assumes state.stepNr exists!
        } 
    }
    return {bars: bars}
}

export class BarPlot extends PureComponent {

    render() {
        let {width, height, bars} = this.props;

        return(
            <FlexibleWidthXYPlot 
                    width={width} 
                    height={height} 
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
                {bars.length > 0 ? <XAxis /> : null}
                {bars.length > 0 ? <YAxis /> : null}
                        
            </FlexibleWidthXYPlot>
        )
    }
}

const BarPlotStore = connect(mapStateToPropsBars)(BarPlot);

export {BarPlotStore};