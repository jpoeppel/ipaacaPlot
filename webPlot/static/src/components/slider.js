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
  },
  title: "Slider",
  width: 10,
  height: 2,
  allowMultipleSources: false
}

function mapStateToProps(state, ownProps) {
    let data = state.data
    let source = ownProps.config[0]; //There should only be one in a slider

    let minV = 0;
    let maxV = Infinity;
    

    let channelData = data.channels[source.channel]
    if (channelData && channelData[source.dataKeys[0].val]) { 
      maxV = channelData[source.dataKeys[0].val].length;
    }

    let value = maxV;  
    if (state.data.stepNr) {
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
    this.props.onSliderChange(value);
  };


  render () {
    // const { value } = this.state
    const labels = {
      0: '',
      50: '',
      100: ''
    }

    const {min, max, value} = this.props;

    console.log("max val: ", max);

    const formatkg = value => value + ' kg'

    return (
      <div className='slider custom-labels'>
        <Slider
          min={min}
          max={max}
          value={value}
          labels={labels}
          // handleLabe
          l={value}
          onChange={this.handleChangeSlider}
          
        />
        <div className='value'>{value}</div>
      </div>
    )
  }
}

export default CustomSlider;

export const CustomSliderStore = connect(mapStateToProps, mapDispatchToProps)(CustomSlider)