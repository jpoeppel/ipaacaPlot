import React, { Component } from 'react';

export default class ConditionSelection extends Component {


    onClick(val) {
        console.log("Button clicked: ", val);
    }

    render () {

        var conditions = ["test1", "test2"];

        return (
            <div className="condition-list">
                
                    {conditions.map(cond => {
                        return (
                            <li>
                                <span name="conditionName">{cond}</span>
                                <span align="right">
                                    <select id={"visSelect_"+cond}>
                                        <option value="1">
                                            1
                                        </option>
                                    </select>
                                </span>
                                <span> 
                                    <input id={"btn"+cond} type="button" value="Visualize" onClick={() => this.props.onSelect(cond)} /> 
                                </span>
                                </li>
                        )
                    })}
            </div>
        )
    }

}