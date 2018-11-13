import { combineReducers } from 'redux';

const initialState = {
    channels: {}
};

function baseReducer(prevState = initialState, action) {

    // console.log("prev state ", prevState)
    let newState = Object.assign({}, prevState);
    switch (action.type) {
        case "UPDATE_CHANNEL_REPLACE": {
            let channels =  Object.assign({}, newState.channels);
            let channel = channels[action.channel] ? Object.assign({}, channels[action.channel]) : {};
            channel[action.dataKey] = action.payload;
            channels[action.channel] = channel;
            newState.channels = channels;
            return newState;
        }
        case "UPDATE_CHANNEL_ADD": {
            let channels =  Object.assign({}, newState.channels);

            if (!channels[action.channel]) {
                channels[action.channel] = {};
            }
            let channel = Object.assign({},channels[action.channel]);
            if (channel[action.dataKey]) {
                channel[action.dataKey].push(action.payload);
            } else {
                channel[action.dataKey] = [action.payload];
            }
            channels[action.channel] = channel;
            newState.channels = channels;
            return newState;
        }
        case "ADD_MSG_FNC": {
            console.log("adding message send function")
            newState.sendMessage = action.payload;
            return newState;
        }
        case "CLEAN_CHANNEL": {
            let channels =  Object.assign({}, newState.channels);
            let channel = Object.assign({},channels[action.channel]);

            for (var i=0;i<action.dataKeys.length;i++) {
                delete channel[action.dataKeys[i].val]
            }

            if (Object.keys(channel).length === 0) {
                delete channels[action.channel];
            } else {
                channels[action.channel] = channel
            }

            newState.channels = channels;
            return newState;
        }
        case "SET_STEPNR": {
            newState.stepNr = action.stepNr;
            return newState;
        }
        default:
            return prevState;
    }
}


export default function createReducer(asyncReducers) {
  return combineReducers({
      data: baseReducer,
    ...asyncReducers
  });
}