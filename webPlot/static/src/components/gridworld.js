import React, { PureComponent } from 'react';

class CanvasGridworld extends PureComponent {

    constructor (props, context) {
        super(props, context)
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
            this.updateCanvas();
    }

    renderMap() {
        let map = this.props.map.map;
        let canvas = this.refs[this.props.bgname];
        // let canvas = document.getElementById(this.props.name);
        let context = canvas.getContext('2d');

        // var canvasMaxWidth = window.innerWidth * scaling;
        // var canvasMaxHeight = window.innerHeight * scaling;

        let canvasMaxWidth = canvas.width;
        let canvasMaxHeight = canvas.height;

        var tileSize = Math.min(Math.floor(canvasMaxWidth/map[0].length), Math.floor(canvasMaxHeight/map.length));
        canvas.width = tileSize*map[0].length;
        canvas.height = tileSize*map.length;
        context.clearRect(0, 0, canvas.width, canvas.height);            

        let renderTile = this.renderTile;

        const showTrueTarget = this.props.showTrueTarget;
        const showBeliefSymbols = this.props.showBeliefSymbols;
        const goalPos = this.props.map.goalPos;
        const targets = this.props.map.targets;
        const goalBeliefs = this.props.beliefs ? this.props.beliefs.goal: null;
        const worldBelief = this.props.beliefs ? this.props.beliefs.world : null;

        const showVisibles = this.props.showVisibles;
        const showBeliefedVision = this.props.showBeliefedVision;
        const visibles = this.props.visibles;


        if (visibles && (showVisibles || (showBeliefedVision && worldBelief === "FreeSpace"))) {
            // Render everything black and only render visible tiles!
            context.fillStyle = "black";
            context.fillRect(0,0, canvas.width, canvas.height);
            visibles.forEach(function(el) {
                let tile = Object.assign({}, map[el[0]][el[1]]);
                renderTile(context, tile, tileSize, el[1], el[0]);
            })
        } else {
            map.forEach(function(row,i, arr) {
                row.forEach(function(tile, j, row) { 
                        tile = Object.assign({}, tile);
                        if ((showTrueTarget) && i === goalPos[0] && j === goalPos[1]) {
                            
                            tile.color = "green";
                            tile.symbol = "T";
                        }   
                        renderTile(context, tile, tileSize, j, i);
                })
            })

        }

        if (showBeliefSymbols && goalBeliefs) {
            for (var i=0; i<targets.length; i++) {
                let pos = targets[i].key;
                let tile = Object.assign({}, map[pos[0]][pos[1]]);
                tile.symbol = goalBeliefs[i];
                tile.color = "lightblue";
                renderTile(context, tile, tileSize, pos[1], pos[0]);
            }
        }

        if (goalBeliefs) {
            targets.forEach( (tile,i) => {
                let pos = tile.key;
                let symbol = tile.val.symbol;
                let beliefSymbol = goalBeliefs[i];
                if (beliefSymbol == this.props.beliefs.desire) {
                    let tileContent = Object.assign({}, tile.val);
                    tileContent.color = "lightgreen";
                    tileContent.symbol = beliefSymbol;
                    renderTile(context, tileContent, tileSize, pos[1], pos[0]);
                }
            });
        }

        if (this.props.showTargets) {
            targets.forEach( tile => {
                let pos = tile.key;
                let symbold = tile.val.symbol;
                let tileContent = Object.assign({}, tile.val);

                if (!this.props.showTrueColor) {
                    var hideTile = true;
                    if (visibles) {
                        for (var i in visibles) {
                            if (visibles[i][0] == pos[0] && visibles[i][1] == pos[1]) {
                                hideTile = false;
                            }
                        }
                    } 
                    if (hideTile) {
                        console.log("render green")
                        tileContent.color = "green";
                        tileContent.symbol = "";
                    }
                }
                if (showTrueTarget && pos[0] == goalPos[0] && pos[1] == goalPos[1]) {
                    tileContent.symbol = "T";
                }
                renderTile(context, tileContent, tileSize, pos[1], pos[0]);
            })
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
        // tileSize = sizeInfo[0];
        // canvas.width = sizeInfo[1];
        // canvas.height = sizeInfo[2];
        let tileSize = this.tileSize;
        let posX = this.props.pos[1];
        let posY = this.props.pos[0];
        const canvas = this.refs[this.props.bgname];
        var context = canvas.getContext("2d");
        context.strokeStyle = "black";
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

    renderPath() {
        const canvas = this.refs[this.props.bgname];
        let tileSize = this.tileSize;
        let traj = this.props.traj;
        
        var context = canvas.getContext("2d");         
        context.strokeStyle = "red";
        context.beginPath();
        traj.forEach(function(pos, i, traj) {
            
            let centerX = pos[1]*tileSize + tileSize/2; // +offX;
            let centerY = pos[0]*tileSize + tileSize/2; // +offY;
            if (i == 0) {
                context.moveTo(centerX, centerY);   
            } else {
                context.lineTo(centerX,centerY);
            }
            
        })
        context.stroke();       
    }

    updateCanvas() {
        if (this.props.map) {
            this.renderMap();

            if (this.props.showPath) {
                this.renderPath()
            }
            this.renderAgent();
        };
    }

    render() {
        let { bgname, fgname, width, height } = this.props;
        return (
            <div>
                <canvas ref={bgname} width={width} height={height} />
                {/* <canvas className={"agentcanvas canvas"} ref={fgname} width={width} height={height} /> */}
            </div>
        )
    }

}

export default CanvasGridworld;