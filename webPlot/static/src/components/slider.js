import React, { Component } from 'react'
import Slider from 'react-rangeslider'

// To include the default styles
import 'react-rangeslider/lib/index.css'


class CustomSlider extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      value: 10,
    }
  }

  handleChangeSlider = value => {
    this.setState({
      value: value
    })
    this.props.onSliderChange(value);
  };


  render () {
    const { value } = this.state
    const labels = {
      0: '',
      50: '',
      100: ''
    }

    const formatkg = value => value + ' kg'

    return (
      <div className='slider custom-labels'>
        <Slider
          min={0}
          max={100}
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