import React, { Component } from 'react';

import classNames from 'classnames';

export default class ModuleSelection extends Component {
    constructor (props, context) {
        super(props, context)

        this.state = {
            selectedID: null
        }
    }


    render () {
        var { moduleList } = this.props;

        return (
            <div>
                <div className="module-selection">
                    {moduleList.map( (m) => {
                        return(<div key={m.id} className={classNames("module", {"selected": m.id === this.state.selectedID})} onClick={ (e) => {this.setState({selectedID: m.id})}}>
                            <img src={m.img} alt={"Test"} width={80}/>
                            <span>{m.name}</span>
                        </div>)
                    })}
                </div>
                <button onClick={ () => {this.props.addModule(this.state.selectedID) } } >
                    Add Module
                </button>
            </div>

        )
    }

}