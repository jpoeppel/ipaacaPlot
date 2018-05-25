import React, { Component } from 'react';


class Condition extends Component {

    constructor(props) {
        super(props);
        this.optionChanged = this.optionChanged.bind(this);
    }

    optionChanged(event) {
        this.option = event.target.value;
    }


    componentDidMount() {
        if (this.props.count > 0) {
            this.option = 1;
        }
    }

    render() {

        const {name, count} = this.props;

        var options = [];
        for (var i=1; i<= count; i++) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            )
        }

        return (
            <li><span>
                <span name="conditionName">{name}</span>
                <span align="right">
                    <select id={"visSelect_"+name} onChange={this.optionChanged}>
                        {options}
                    </select>
                </span>
                <span> 
                    <input id={"btn"+name} type="button" value="Visualize" onClick={() => this.props.onSelect(name, this.option)} /> 
                </span>
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

        keys = keys.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

        return keys.map(key => {
            return <Condition key={key} onSelect={this.props.onSelect} name={key} count={dict[key]} />
        });
    }

    render () {
        var { conditions } = this.props;

        return (
            <div className="condition-list">
                <ul>
                    {this.create_list(conditions)}
                </ul>
            </div>
        )
    }

}