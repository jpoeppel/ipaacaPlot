import React, { Component } from 'react';
import ChartControls from './chartControls';




class Element extends Component {


    render() {

        return (
            <div className={"element"}>
                {this.props.children}
                <ChartControls title={"ElementCtrl"} group={"Data"}>
                    <div name="Data">
                        Test2
                    </div>
                    <div name="Display">
                        Test
                    </div>
                </ChartControls>
            </div>
        )
    }
}

export default Element;