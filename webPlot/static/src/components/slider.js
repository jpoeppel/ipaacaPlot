import React, { PureComponent } from 'react'
import {connect} from 'react-redux';
import Slider from 'react-rangeslider'

// To include the default styles
import 'react-rangeslider/lib/index.css'
// import { connect } from 'tls';


export const SliderInformation = {
  type: "Slider",
  dataSrc: {
      channel: "tcp:9080",
      dataKeys: [{"name": "Payload key", "val": "y", "log": null}],
      passive: true
  },
  title: "Slider",
  width: 10,
  height: 2,
  allowMultipleSources: false
}

function mapStateToProps(state, ownProps) {
    let data = state.data;
    let source = ownProps.config[0]; //There should only be one in a slider

    let minV = 0;
    let maxV = Infinity;
    
    let channelData = data.channels[source.channel];
    if (channelData && channelData[source.dataKeys[0].val]) { 
      maxV = channelData[source.dataKeys[0].val].length;
    }

    let value = maxV;  
    if (state.data.stepNr && state.data.stepNr !== Infinity) {
      value = state.data.stepNr;
    } 
    return {min: minV, max: maxV, value: value}
}

function mapDispatchToProps(dispatch) {
  return {
      onSliderChange: (v) => {
        let action = {
          type: "SET_STEPNR",
          stepNr: v
        }
        dispatch(action);
      }
  }
}


class CustomSlider extends PureComponent {

  handleChangeSlider = value => {
    if (value === this.props.max) {
      this.props.onSliderChange(Infinity);
    } else {
      this.props.onSliderChange(value);
    }
  };


  render () {
    const {min, max, value} = this.props;
    const labels = {
      0: min,
      max: max
    }


    console.log("max val: ", max);

    return (
      <div className='slider custom-labels'>
        <Slider
          min={min}
          max={max}
          value={value}
          // labels={labels}
          l={value}
          onChange={this.handleChangeSlider}
          
        />
        {/* <input type="range" min={min} max={max} value={value} onChange={this.handleChangeSlider} /> */}
        <div className='value'>{value}</div>
      </div>
    )
  }
}

export default CustomSlider;

export const CustomSliderStore = connect(mapStateToProps, mapDispatchToProps)(CustomSlider)