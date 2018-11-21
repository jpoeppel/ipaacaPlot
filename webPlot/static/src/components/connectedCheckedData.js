// import React, { PureComponent } from 'react'
import {connect} from 'react-redux';
import CheckedText from './checkedData';


export const CheckedTextInformation = {
  type: "CheckedText",
  dataSrc: {
      channel: "tcp:9080",
      dataKeys: [{"name": "Payload key", "val": "checked", "log": true}]
  },
  title: "Checked Text",
  width: 3,
  height: 5,
  allowMultipleSources: false
}

function mapStateToProps(state, ownProps) {
    let data = state.data;
    let source = ownProps.config.dataConfig[0]; //There should only be one in a CheckedText
    
    var checkedData = {};
    let channelData = data.channels[source.channel];
    if (channelData && channelData[source.dataKeys[0].val]) { 
        let idx = channelData[source.dataKeys[0].val].length-1;
        if (state.data.stepNr && state.data.stepNr < Infinity) {
            idx = state.data.stepNr-1;
        }
      checkedData = channelData[source.dataKeys[0].val][idx];
    }

    return {data: checkedData}
}


export const CheckedTextStore = connect(mapStateToProps)(CheckedText);
