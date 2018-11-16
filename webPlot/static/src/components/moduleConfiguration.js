import React, { Component, PureComponent } from 'react';

import {updateState} from '../utils';

export class SourceBlock extends PureComponent {

    render() {
        let {id, configOptions, allowRemoval} = this.props;

        let elements = []

        for (var key in configOptions) {
            let idS = `dataConfig.${id}.${key}`;

            let oldVal = configOptions[key];
            if (Object.prototype.toString.call(oldVal) == '[object Array]') {
                // console.log("old val: ", oldVal)
                for (var i=0; i < oldVal.length; i++) {
                    let dataKeyObj = oldVal[i];
                    const listIdx = i;
                    let idS = `dataConfig.${id}.dataKeys.${listIdx}.`;
                    elements.push(
                        <span>{dataKeyObj.name} : <input type="text" id={idS + "val"} value={dataKeyObj.val} onChange={this.props.updateValues}/>  
                        {dataKeyObj.log !== null ? ["Log :", <input type="checkbox" id={idS+"log"} value={dataKeyObj.log} checked={dataKeyObj.log} onChange={this.props.updateValues}/> ]: null}
                        </span>
                        );
                }
            } else if ( Object.prototype.toString.call(oldVal) == '[object Boolean]') {
                elements.push(
                    <span>{key} : <input type="checkbox" id={idS} value={oldVal} checked={oldVal} onChange={this.props.updateValues}/>  </span>
                    );
            } else {
                if (key == "color") {
                    elements.push(
                        <span>{key} : <input type="color" id={idS} value={oldVal} onChange={this.props.updateValues}/>  </span>
                        );
                } else {

                    elements.push(
                    <span>{key} : <input type="text" id={idS} value={oldVal} onChange={this.props.updateValues}/>  </span>
                    );
                }
            }
        }

        return(
            <div className={"bordered vflex margin"}>
                {/* {id} */}
                {elements}
                <button onClick={ () => {this.props.removeDataSource(id)}} disabled={!allowRemoval}>
                        Remove Source
                </button>
            </div>
        )
    }
}

export default class ModuleConfiguration extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            dataConfig: [JSON.parse(JSON.stringify(props.moduleInformation.dataSrc))],
            moduleConfig: { title: props.moduleInformation.title,
                            width: props.moduleInformation.width,
                            height: props.moduleInformation.height},
        }
        this.iDCounter = 0;
        this.removeDataSource = this.removeDataSource.bind(this);
        this.updateValues = this.updateValues.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }
    
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside(event) {
        if (!this.containerDiv.contains(event.target)) {
            this.props.closeConfig();
        }
    }
    

    updateValues(e) {
        let keys = e.target.id.split(".");
        let val = e.target.type === "checkbox" ? JSON.parse(e.target.checked) : e.target.value;
        let newState = updateState(this.state, keys, val);
        this.setState(newState);
    }

    addDataSource() {
        this.iDCounter = this.iDCounter+1;
        console.log("id counter: ", this.iDCounter)
        var newState = {...this.state};
        console.log("new state: ", newState)
        var newConfigs = JSON.parse(JSON.stringify(this.props.moduleInformation.dataSrc)); //Create copy of config
        newConfigs.name = this.iDCounter;
        newState.dataConfig.push(newConfigs);
        this.setState(newState);
    }

    removeDataSource(id) {
        var newState = {...this.state};
        newState.dataConfig.splice(id,1);
        this.setState(newState);
    }

    createDataSrcInputs() {
        let sourceBlocks = [];
        // console.log("create data src inputs state: ", this.state)
        for (var i=0; i<this.state.dataConfig.length; i++) {
            var config = this.state.dataConfig[i];
            sourceBlocks.push(<SourceBlock key={i} id={i} 
                                    configOptions={config} 
                                    removeDataSource={this.removeDataSource}
                                    updateValues={this.updateValues}
                                    allowRemoval={Object.keys(this.state.dataConfig).length > 1}
                            />)
        }
        return sourceBlocks;
    }

    render() {

        let {children, moduleInformation} = this.props;
        let idS = `moduleConfig.`;
        return(
            <div className={"moduleConfig"} ref={node => this.containerDiv = node}>
                <div className={"vflex"}>
                    <h4>{moduleInformation.type}</h4>    
                    <span>Title: <input type="text" id={idS + "title"} value={this.state.moduleConfig.title} 
                        onChange={this.updateValues} /> </span>
                    <span>Width # Cols: <input type="text" id={idS + "width"} value={this.state.moduleConfig.width} 
                        onChange={this.updateValues} /> </span>
                    <span>Height # Rows: <input type="text" id={idS + "height"} value={this.state.moduleConfig.height}
                        onChange={this.updateValues}/></span>
                    <div className={"borderedContainer"}>
                        {this.createDataSrcInputs()}
                        {moduleInformation.allowMultipleSources ? <button onClick={ () => {this.addDataSource()}}>
                        Add Data Source
                    </button> : ""}
                    </div>
                    {children}
                    <button onClick={ () => {this.props.createModule(moduleInformation.type, {...this.state})}}>
                        Create Module
                    </button>
                </div>
            </div>
        )
    }
}