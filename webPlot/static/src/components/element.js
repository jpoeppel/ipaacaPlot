import React, { Component } from 'react';
import classnames from 'classnames';


class Element extends Component {


    render() {

        if (this.props.children) {

            return (
                <div {...this.props} className={classnames('element', this.props.className)} >
                    <div className="element_handle">{this.props.id}</div>
                    {this.props.children}
                </div>
            )
        } else {
            return null;
        }
    }
}

export default Element;