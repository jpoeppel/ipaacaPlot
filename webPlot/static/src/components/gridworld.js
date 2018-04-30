import React, { Component } from 'react';

class CanvasComponent extends Component {

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
    }

    renderMap() {
        let map = this.props.map;
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

        let renderTile = this.renderTile

        map.forEach(function(row,i, arr) {
            row.forEach(function(tile, j, row) { 
                // if (tile.color != "") {
                    renderTile(context, tile, tileSize, j, i);
                // }
            })
        })

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
        let posX = this.props.pos[0];
        let posY = this.props.pos[1];
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

export default CanvasComponent;