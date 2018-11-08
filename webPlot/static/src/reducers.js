import { combineReducers } from 'redux';

const initialState = {};

function baseReducer(prevState = initialState, action) {

    console.log("prev state ", prevState)

    switch (action.type) {
        case "UPDATE_CHANNEL_REPLACE": {
            let newState = Object.assign({}, prevState);
            let channel = newState.channels[action.channel];
            channel[action.dataKey] = action.payload;
            // newState.channels[action.channel] = channel;
            return newState;
        }
        case "UPDATE_CHANNEL_ADD": {
            let newState = Object.assign({}, prevState);
            let channel = newState.channels[action.channel];
            if (channel[action.dataKey]) {
                channel[action.dataKey].push(action.payload);
            } else {
                channel[action.dataKey] = [action.payload];
            }
            return newState;
        }
        default:
            return prevState
    }
}


export default function createReducer(asyncReducers) {
  return combineReducers({
      baseReducer,
    ...asyncReducers
  });
}