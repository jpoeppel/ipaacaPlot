import React, { PureComponent } from 'react'

class CheckedText extends PureComponent {

  render () {
    const {data} = this.props;

    let elements = [];
    for (var key in data) {
      elements.push(
        <span> {`${key}: `} <input type="checkbox" readonly={true} checked={data[key]}/></span>
      )
    }
    return (
      <div className='vflex'>
        {elements}
      </div>
    )
  }
}

export default CheckedText;

CheckedText.defaultProps = {
  data: {test: false, no_data: true}
}
