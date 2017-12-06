import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class ChannelCtrl extends PureComponent {

 
    render() {
    
        let tiles = this.props.tiles;
        
        let options = tiles.map( (tile) => {
                                    return <option value={tile.id}>{tile.id}</option>
                                });
        options = options.concat(<option value="new">New</option>);
    
        return (
            <div>
                Channel: <input type="text" id="channel" />
                Plottype: <select id="plottype">
                            <option value="line">Lineplot</option>
                            <option value="bar">Barplot</option>
                          </select>     
                Color:  <input type="color" id="color" />
                Add to panel: <select id="tile">
                                {options}
                            </select>
                
                <button onClick={this.props.addChannel} >
                    Add Channel
                </button>
            </div>
        )
    }
}

ChannelCtrl.propTypes = {
    tiles:          PropTypes.array,
    addChannel:     PropTypes.func
}