import React, { Component } from 'react'
import classnames from 'classnames';

import twg from '../img/twg.svg'
import tw from '../img/tw.svg'
import tg from '../img/tg.svg'

class ModelVis extends Component {
  constructor (props, context) {
    super(props, context)
  }

  render () {
    let curModel = this.props.curModel;

    var classesSelected = classnames(
        "model",
        "selected"
    ) 

    var classes = classnames(
        "model"
    )

    console.log("cur model: ", curModel)
    return (
      <div className='model-vis'>
        <div className={curModel == "TWG" ? classesSelected : classes}>
            <img src={twg} width={200}/>
        </div>
        <div className={curModel == "TW" ? classesSelected : classes}>
            <img src={tw} width={200}/>
        </div>
        <div className={curModel == "TG" ? classesSelected : classes}>
            <img src={tg} width={200}/>
        </div>
      </div>
    )
  }
}

export default ModelVis;