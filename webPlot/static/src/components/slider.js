import React, { Component } from 'react'
import Slider from 'react-rangeslider'

// To include the default styles
import 'react-rangeslider/lib/index.css'


class CustomSlider extends Component {
  constructor (props, context) {
    super(props, context)
    // this.state = {
    //   value: props.value,
    // }
  }

  handleChangeSlider = value => {
    // this.setState({
    //   value: value
    // })
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
          handleLabel={value}
          onChange={this.handleChangeSlider}
        />
        <div className='value'>{value}</div>
      </div>
    )
  }
}

export default CustomSlider;