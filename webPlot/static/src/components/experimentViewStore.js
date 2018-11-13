import {connect} from 'react-redux';

import ExperimentView from "./experimentView"


export const ExperimentViewInformation = {
    type: "ExperimentView",
    dataSrc: {
        channel: "zmq:5057",
        dataKeys: [{"name": "Run Data", "val": "runData", "log": false}],
    },
    title: "ExperimentView",
    width: 10,
    height: 6,
    allowMultipleSources: false
}

function mapStateToProps(state, ownProps) {

    console.log("State: ", state);
    let data = state.data;
    let source = ownProps.config[0]; //There is only 1 source
    let channelData = data.channels[source.channel];
    state.data.sendMessage(source.channel, {"selection": {"condition": "condMap1_C2_V1", "runNr": 1, "methods": {"twg":true}}});
    let stepNr = 0;
    let agentPos = null;
    if (channelData && channelData[source.dataKeys[0].val]) { 
        channelData = channelData[source.dataKeys[0].val]
        if (data.stepNr) {
            stepNr = data.stepNr;
        } else {
            stepNr = channelData.agentPositions.length-1;
        }
        agentPos = channelData.agentPositions[stepNr]
        return { bgname: "bg", 
             fgname: "fb", 
             conditionName: "TO FIX", 
             pos: agentPos, 
             map: {"map": channelData.map, "targets": channelData.targets, "goalPos": channelData.goalPos}, 
             traj: channelData.agentPositions.slice(0, stepNr+1), 
             visibles: channelData.visibles ? channelData.visibles[stepNr] : [], 
             beliefs: channelData.sampling ? channelData.sampling.sampleList[stepNr][0] : null}
    } 

    return {}
}


const ExperimentViewStore = connect(mapStateToProps)(ExperimentView);

export {ExperimentViewStore};