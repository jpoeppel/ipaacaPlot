import React, { Component } from 'react';


class Condition extends Component {

    constructor(props) {
        super(props);
        this.optionChanged = this.optionChanged.bind(this);
    }

    optionChanged(event) {
        this.option = event.target.value;
    }


    render() {

        const {name, count} = this.props;

        var options = [];
        for (var i=1; i<= count; i++) {
            options.push(
                <option value={i}>
                    {i}
                </option>
            )
        }

        return (
            <li>
                <span name="conditionName">{name}</span>
                <span align="right">
                    <select id={"visSelect_"+name} onChange={this.optionChanged}>
                        {options}
                    </select>
                </span>
                <span> 
                    <input id={"btn"+name} type="button" value="Visualize" onClick={() => this.props.onSelect(name, this.option)} /> 
                </span>
            </li>

        )
    }
}


export default class ConditionSelection extends Component {


    onClick(val) {
        console.log("Button clicked: ", val);
    }


    create_list(dict) {
        var res = [];
        var keys = [];
        for (var key in dict) {
            keys = keys.concat([key]);
        }

        return keys.map(key => {
            return <Condition onSelect={this.props.onSelect} name={key} count={dict[key]} />
        });
    }

    render () {
        var { conditions } = this.props;

        return (
            <div className="condition-list">
                    {this.create_list(conditions)}
            </div>
        )
    }

}