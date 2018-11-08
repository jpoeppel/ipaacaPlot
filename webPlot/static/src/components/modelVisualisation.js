import React, { PureComponent } from 'react'
import classnames from 'classnames';

import twg from '../img/twg.svg'
import tw from '../img/tw.svg'
import tg from '../img/tg.svg'

class ModelVis extends PureComponent {
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
            <img src={twg} alt={"TWG"} width={200}/>
        </div>
        <div className={curModel == "TW" ? classesSelected : classes}>
            <img src={tw} alt={"TW"} width={200}/>
        </div>
        <div className={curModel == "TG" ? classesSelected : classes}>
            <img src={tg} alt={"TG"} width={200}/>
        </div>
      </div>
    )
  }
}

export default ModelVis;