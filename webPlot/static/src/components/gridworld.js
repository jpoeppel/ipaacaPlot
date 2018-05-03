import React, { Component } from 'react';

class CanvasComponent extends Component {

    constructor (props, context) {
        super(props, context)
        this.state = {
          showTargets: false,
          showTrueColor: false,
          showTrueTarget: false
        }

        this.onChangeShowTargets = this.onChangeShowTargets.bind(this);
        this.onChangeshowTrueColor = this.onChangeshowTrueColor.bind(this);
        this.onChangeshowTrueTarget = this.onChangeshowTrueTarget.bind(this);
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    renderMap() {
        let map = this.props.map.map;
        console.log("render map");
        let canvas = this.refs[this.props.bgname];
        // let canvas = document.getElementById(this.props.name);
        let context = canvas.getContext('2d');

        // var canvasMaxWidth = window.innerWidth * scaling;
        // var canvasMaxHeight = window.innerHeight * scaling;

        let canvasMaxWidth = canvas.width;
        let canvasMaxHeight = canvas.height;

        var tileSize = Math.min(Math.floor(canvasMaxWidth/map[0].length), Math.floor(canvasMaxHeight/map.length));
        // canvas.width = tileSize*map[0].length;
        // canvas.height = tileSize*map.length;
        context.clearRect(0, 0, canvas.width, canvas.height);            

        let renderTile = this.renderTile;

        const showTrueTarget = this.state.showTrueTarget;
        const goalPos = this.props.map.goalPos;
        console.log("goalpos: ", goalPos)
        map.forEach(function(row,i, arr) {
            row.forEach(function(tile, j, row) { 
                // if (tile.color != "") {
                    if (showTrueTarget && i === goalPos[0] && j === goalPos[1]) {
                        tile = Object.assign({}, tile)
                        tile.color = "green";
                        tile.symbol = "T";
                    }   
                    renderTile(context, tile, tileSize, j, i);
                // }
            })
        })

        if (this.state.showTargets) {
            this.props.map.targets.forEach( tile => {
                let pos = tile.key;
                let tileContent = Object.assign({}, tile.val);
                if (!this.state.showTrueColor) {
                    tileContent.color = "green";
                    tileContent.symbol = "";
                }
                if (showTrueTarget && pos[0] == goalPos[0] && pos[1] == goalPos[1]) {
                    tileContent.symbol = "T";
                }
                renderTile(context, tileContent, tileSize, pos[1], pos[0]);
            })
        }

        if (this.state.showTrueTarget) {

        }

        this.tileSize = tileSize;
    }

    renderTile(context, tile, tileSize, posX, posY) {
        context.fillStyle = tile.color === "" ? "rgba(255,255,255,1)" : tile.color;
        context.fillRect(posX * tileSize, posY* tileSize, tileSize, tileSize);

        context.font = 0.8*tileSize +"px Ariel";
        context.fillStyle = "black";
        context.fillText(tile.symbol, posX*tileSize+0.2*tileSize, posY*tileSize+0.8*tileSize);
    }

    renderAgent() {
        console.log("render agent");
        // tileSize = sizeInfo[0];
        // canvas.width = sizeInfo[1];
        // canvas.height = sizeInfo[2];
        let tileSize = this.tileSize;
        let posX = this.props.pos[1];
        let posY = this.props.pos[0];
        const canvas = this.refs[this.props.bgname];
        var context = canvas.getContext("2d");
        // context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        let centerX = posX*tileSize + tileSize/2;
        let centerY = posY*tileSize + tileSize/2;
        context.arc(centerX, centerY, 
                    tileSize*0.4, 0, 2*Math.PI);
        context.fillStyle = "yellow";
        context.fill();
        context.stroke();
        
        let eyeSize = tileSize/16;
        //Draw left eye
            context.fillStyle = "black";
        context.beginPath();
        context.arc(centerX-tileSize/7, centerY-tileSize/12, eyeSize, 0, 2*Math.PI);
        context.fill();
        context.stroke();
        
        //Draw right eye
        context.beginPath();
        context.arc(centerX+tileSize/7, centerY-tileSize/12, eyeSize, 0, 2*Math.PI);
        context.fill();
        context.stroke();
        
        //Draw mouth
        context.beginPath();
        context.arc(centerX, centerY, tileSize/5, Math.PI*5/6, Math.PI*1/6, true);
        context.stroke();
        
    }

    updateCanvas() {
        this.renderMap()
        this.renderAgent()
    }

    onChangeShowTargets() {
        this.setState({
            showTargets: !this.state.showTargets
        })
    }

    onChangeshowTrueColor() {
        this.setState({
            showTrueColor: !this.state.showTrueColor
        })
    }

    onChangeshowTrueTarget() {
        this.setState({
            showTrueTarget: !this.state.showTrueTarget
        })
    }

    render() {
        let { bgname, fgname, width, height, conditionName } = this.props;
        return (
            <div>
                <h2>{conditionName}</h2>
                <canvas ref={bgname} width={width} height={height} />
                <div>
                    Show Targets:
                    <input type="checkbox" value={this.state.showTargets} onChange={this.onChangeShowTargets} />
                </div>
                <div>
                    Show True Color:
                    <input type="checkbox" value={this.state.showTrueColor} onChange={this.onChangeshowTrueColor} />
                </div>
                <div>
                    Show True Target:
                    <input type="checkbox" value={this.state.showTrueTarget} onChange={this.onChangeshowTrueTarget} />
                </div>
                {/* <canvas className={"agentcanvas canvas"} ref={fgname} width={width} height={height} /> */}
            </div>
        )
    }

}

export default CanvasComponent;