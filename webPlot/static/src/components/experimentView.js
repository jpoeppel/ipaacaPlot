import React, { Component } from 'react';

import CanvasGridworld from "./gridworld"

class ExperimentView extends Component {

    constructor (props, context) {
        super(props, context)
        this.state = {
          showTargets: props.beliefs ? false : true,
          showTrueColor: props.beliefs ? false : true,
          showTrueTarget: false,
          showBeliefSymbols: props.beliefs ? true : false,
          showPath: false,
          showVisibles: false,
          showBeliefedVision: false,
          showSeenColor: false,
          visiblesUpdated: false
        }

        this.onChangeShowTargets = this.onChangeShowTargets.bind(this);
        this.onChangeShowTrueColor = this.onChangeShowTrueColor.bind(this);
        this.onChangeShowTrueTarget = this.onChangeShowTrueTarget.bind(this);
        this.onChangeShowBeliefSymbols = this.onChangeShowBeliefSymbols.bind(this);
        this.onChangeShowPath = this.onChangeShowPath.bind(this);
        this.onChangeShowVisibles = this.onChangeShowVisibles.bind(this);
        this.onChangeShowBeliefedVision = this.onChangeShowBeliefedVision.bind(this);
        this.onChangeShowSeenColor = this.onChangeShowSeenColor.bind(this);
    }


    static getDerivedStateFromProps(nextProps, prevState) {
        if ((!nextProps.visibles || nextProps.visibles.length === 0) && !prevState.visiblesUpdated ) {
            return {showVisibles: false,
                    visiblesUpdated: false,
                    showBeliefedVision: false};
        };

        return {visiblesUpdated: false};
    }

    onChangeShowTargets() {
        this.setState({
            showTargets: !this.state.showTargets
        })
    }

    onChangeShowTrueColor() {
        this.setState({
            showTrueColor: !this.state.showTrueColor
        })
    }

    onChangeShowTrueTarget() {
        this.setState({
            showTrueTarget: !this.state.showTrueTarget
        })
    }

    onChangeShowBeliefSymbols() {
        this.setState({
            showBeliefSymbols: !this.state.showBeliefSymbols
        })
    }

    onChangeShowPath() {
        this.setState({
            showPath: !this.state.showPath
        })
    }

    onChangeShowVisibles() {
        this.props.requestVisibles()
        this.setState({
            showVisibles: !this.state.showVisibles,
            visiblesUpdated: true
        });
    }

    onChangeShowBeliefedVision() {
        this.props.requestVisibles()
        this.setState({
            visiblesUpdated: true,
            showBeliefedVision: !this.state.showBeliefedVision
        })
    }

    onChangeShowSeenColor() {
        this.props.requestVisibles()
        this.setState({
            visiblesUpdated: true,
            showSeenColor: !this.state.showSeenColor
        })
    }

    render() {
        let { bgname, fgname, width, height, conditionName, pos, map, traj, visibles, beliefs } = this.props;
        console.log("experiment view props: ", this.props);
        return (
            <div>
                <div className="condition">{conditionName}</div>
                <CanvasGridworld width={width} height={height} 
                                map={map} bgname={bgname}
                                showTargets={this.state.showTargets}
                                showTrueTarget={this.state.showTrueTarget}
                                showTrueColor={this.state.showTrueColor}
                                showBeliefSymbols={this.state.showBeliefSymbols}
                                showVisibles={this.state.showVisibles}
                                showBeliefedVision={this.state.showBeliefedVision}
                                showPath={this.state.showPath}
                                visibles={visibles}
                                visiblesUpdated={this.state.visiblesUpdated}
                                beliefs={beliefs}
                                traj={traj}
                                pos={pos}
                                />
                <div className={"controls flex"}>
                    <div>
                        Show Targets:
                        <input type="checkbox" defaultChecked={this.state.showTargets} checked={this.state.showTargets} onChange={this.onChangeShowTargets} />
                    </div>
                    <div>
                        Show True Color:
                        <input type="checkbox" defaultChecked={this.state.showTrueColor} checked={this.state.showTrueColor} onChange={this.onChangeShowTrueColor} />
                    </div>
                    <div>
                        Show True Target:
                        <input type="checkbox" defaultChecked={this.state.showTrueTarget} checked={this.state.showTrueTarget} onChange={this.onChangeShowTrueTarget} />
                    </div>
                    <div>
                        Show Belief Symbols:
                        <input type="checkbox" defaultChecked={this.state.showBeliefSymbols} checked={this.state.showBeliefSymbols} onChange={this.onChangeShowBeliefSymbols} />
                    </div>
                    <div>
                        Show Seen Color:
                        <input type="checkbox" defaultChecked={this.state.showSeenColor} checked={this.state.showSeenColor} onChange={this.onChangeShowSeenColor} />
                    </div>
                    {this.props.traj ? <div>
                        Show Path:
                        <input type="checkbox" defaultChecked={this.state.showPath} checked={this.state.showPath} onChange={this.onChangeShowPath} />
                    </div> : ""}
                    {this.props.beliefs ? <div>
                        Show Visible area:
                        <input type="checkbox" defaultChecked={this.state.showVisibles} checked={this.state.showVisibles} onChange={this.onChangeShowVisibles} />
                    </div> : ""}
                    {this.props.beliefs ? <div>
                        Show Beliefed Vision:
                        <input type="checkbox" defaultChecked={this.state.showBeliefedVision} checked={this.state.showBeliefedVision} onChange={this.onChangeShowBeliefedVision} />
                    </div> : ""}
                </div>
                {/* <canvas className={"agentcanvas canvas"} ref={fgname} width={width} height={height} /> */}
            </div>
        )
    }

}

export default ExperimentView;