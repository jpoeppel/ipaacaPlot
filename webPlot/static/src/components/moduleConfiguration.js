import React, { Component } from 'react';


class SourceBlock extends Component {

    render() {
        let {id, sourceInformation, curVals, allowRemoval} = this.props;

        let elements = []

        for (var key in sourceInformation) {
            let oldVal = curVals[key];
            if (Object.prototype.toString.call(oldVal) == '[object Array]') {
                // console.log("old val: ", oldVal)
                for (var i=0; i < oldVal.length; i++) {
                    let dataKeyObj = oldVal[i];
                    const listIdx = i;
                    elements.push(
                        <span>{dataKeyObj.name} : <input type="text" id={dataKeyObj.name} value={dataKeyObj.val} onChange={e => this.props.updateValues(e, "dataConfig", id, listIdx, "val")}/>  
                        {dataKeyObj.log !== null ? ["Log :", <input type="checkbox" id={dataKeyObj.name} value={dataKeyObj.log} checked={dataKeyObj.log} onChange={e => this.props.updateValues(e, "dataConfig", id, listIdx, "log")}/> ]: null}
                        </span>
                        );
                }
            } else {
                if (key == "color") {
                    elements.push(
                        <span>{key} : <input type="color" id={key} value={oldVal} onChange={e => this.props.updateValues(e, "dataConfig", id)}/>  </span>
                        );
                } else {
                    elements.push(
                    <span>{key} : <input type="text" id={key} value={oldVal} onChange={e => this.props.updateValues(e, "dataConfig", id)}/>  </span>
                    );
                }
            }
        }

        return(
            <div className={"bordered vflex margin"}>
                {id}
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
            dataConfig: {0: JSON.parse(JSON.stringify(props.moduleInformation.dataSrc))},
            moduleConfig: { title: props.moduleInformation.title,
                            width: props.moduleInformation.width,
                            height: props.moduleInformation.height},
            idCounter: 0
        }
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
    

    updateValues(e, config, key1=null, key2=null, key3=null) {
        var newState = {...this.state};
        var newConfig = {...newState[config]};

        let attribKey = e.target.id;
        let val = key3 === "log" ? e.target.checked : e.target.value;

        // let acc = [key1,key2];
        // console.log("acc: ", acc)

        let modifyPart = newConfig
        if (key1 !== null) {
            modifyPart = modifyPart[key1]
        }
        if (key2 !== null) {
            modifyPart = modifyPart.dataKeys[key2]
        }
        // let finalVal = acc.reduce( (prev, curr) => {
            // return curr === null ? prev : prev[curr]
        // }, newConfig)
        if (key3 === null) {
            modifyPart[attribKey] = val;
        } else {
            modifyPart[key3] = val;
        }

        newState[config] = newConfig;
        this.setState(newState)
    }

    addDataSource() {
        const newID = this.state.idCounter+1;
        var newState = {...this.state};
        console.log("new state: ", newState)
        newState.idCounter = newID;
        newState.dataConfig[newID] = JSON.parse(JSON.stringify(this.props.moduleInformation.dataSrc));
        this.setState(newState);
    }

    removeDataSource(id) {
        var newState = {...this.state};
        console.log("new state: ", newState)
        delete newState.dataConfig[id];
        this.setState(newState);
    }

    createDataSrcInputs(dataSrcInformation) {
        let sourceBlocks = [];
        // console.log("create data src inputs state: ", this.state)
        // console.log("data Src: ", dataSrcInformation)
        for (var id in this.state.dataConfig) {
            sourceBlocks.push(<SourceBlock key={id} id={id} 
                                    sourceInformation={dataSrcInformation} 
                                    curVals={this.state.dataConfig[id]} 
                                    removeDataSource={this.removeDataSource}
                                    updateValues={this.updateValues}
                                    allowRemoval={Object.keys(this.state.dataConfig).length > 1}
                            />)
        }
        return sourceBlocks;
    }

    render() {

        let {children, moduleInformation} = this.props;

        return(
            <div className={"moduleConfig"} ref={node => this.containerDiv = node}>
                <div className={"vflex"}>
                    <h4>{moduleInformation.type}</h4>    
                    <span>Title: <input type="text" id="title" value={this.state.moduleConfig.title} 
                        onChange={e => this.updateValues(e, "moduleConfig")} /> </span>
                    <span>Width # Cols: <input type="text" id="width" value={this.state.moduleConfig.width} 
                        onChange={e => this.updateValues(e, "moduleConfig")} /> </span>
                    <span>Height # Rows: <input type="text" id="height" value={this.state.moduleConfig.height}
                        onChange={e => this.updateValues(e, "moduleConfig")}/></span>
                    <div className={"borderedContainer"}>
                        {this.createDataSrcInputs(moduleInformation.dataSrc)}
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