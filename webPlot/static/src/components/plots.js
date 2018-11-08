import React, { Component } from 'react';
import {connect} from 'react-redux';

import {FlexibleWidthXYPlot, XAxis, YAxis, Borders, VerticalGridLines, LineSeries} from "react-vis"; // ./3rdParty/
import { getScalePropTypesByAttribute } from 'react-vis/dist/utils/scales-utils';


// An object specifying the kind of information which is requested when creating
// a new LinePlot
export const LinePlotInformation = {
    type: "LinePlot",
    dataSrc: {
        channel: "",
        // dataKey: ["", false], //Tuple containing key and if the key should be logged or not.
        dataKeys: [{"name": "Payload key", "val": "y", "log": false}],
        color: "black",
        strokes: ""
    },
    title: "LinePlot",
    width: 3,
    height: 4,
    allowMultipleSources: true
}

function createLineSeries(channelState, channel, stepNr, sourceProps) {
    
    return <LineSeries key={channel} 
                data={channelState[sourceProps.dataKeys.val].map((el, i) => {
                    if (i > stepNr) {return []}
                    return {"x": i, "y": el}
                    })
                } 
            stroke={sourceProps.color} strokeDasharray={sourceProps.strokes} />
}


function mapStateToPropsLines(state, ownProps) {
    //test if it exists
    let lines = [];
    let vlines = []
    let sources = ownProps.config.dataSources;
    for (var id in sources) {
        let c = sources[id].channel
        if (state.channels[c]) { 
            lines.push(createLineSeries(state.channels[c], c, state.stepNr, sources[id])) //Assumes state.stepNr exists!
        } 
    }

    return {lines: lines, vlines: vlines}
}

export class LinePlot extends Component {


    render() {

        let {width, height, config, lines, vlines} = this.props;

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
    config: {dataSources: {}},
  };

const LinePlotStore = connect(mapStateToPropsLines)(LinePlot);

export {LinePlotStore};


export const BarPlotInformation = {
    dataSrc: {
        channel: "",
        dataKey: ("", false), //Tuple containing key and if the key should be logged or not.
        color: "black",
    },
    allowMultipleSources: true
}

export class BarPlot extends Component {

    render() {
        let {width, height, channel, bars} = this.props;

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
                <XAxis />
                <YAxis />
                        
            </FlexibleWidthXYPlot>
        )
    }
}
