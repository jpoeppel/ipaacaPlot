import React, { Component } from 'react';
import ChartControls from './chartControls';

import Draggable from "react-draggable";
import { Resizable, ResizableBox } from 'react-resizable';

import classnames from 'classnames';


class Element extends Component {


    render() {

        if (this.props.children) {

            return (
                
                // <Draggable handle=".card__header">
                // <div {...this.props}>
                <div {...this.props} className={classnames('element', this.props.className)} >
                {/* // <div className={"element"}> */}
                    <span className="element_handle">{this.props.id}</span>
                    {this.props.children}
                    {/* <ChartControls title={"ElementCtrl"} group={"Data"}>
                        <div name="Data">
                            Test2
                        </div>
                        <div name="Display">
                            Test
                        </div>
                    </ChartControls> */}
                </div>
                // {/* </Draggable> */}
            )
        } else {
            return null;
        }
    }
}

export default Element;