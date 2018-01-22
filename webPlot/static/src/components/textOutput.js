import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ChartControls from "./chartControls";
import Text from "./textplot";

export default class TextOutput extends PureComponent {
    
    createTextChannels(channels) {
        return channels.map( (c) => {
            //Create copy in order to trigger rendere when data changes!
            //let tmpData =c.data.slice();
            console.log("create Text Channels: ", c.data)
            return <Text data={c.data} />
        
        });
    
    }
    
    createChartCtrl(channels, tileIDs) {
        /*let options = tileIDs.map( (tile) => {
                                    return <option value={tile}>{tile}</option>
                                });
        options = options.concat(<option value="new">New</option>);
        */
        return (
            <ChartControls title={"TextOutput settings"} group={"Text series"}>
                  <div name={"Text series"}>
                      {channels.map( (c) => {
                          return ([
                          <div>
                             <div> Channel: {c.id} </div>
                             <div> Color:  <input type="color" id="color" 
                                            value={c.color} 
                                            onInput={ (e) => {
                                                this.props.colorChanged(c.id, e.target);
                                                }
                                            } />
                            </div>
                            <button onClick={ () => {this.props.togglePauseChannel(c) } } >
                               {c.paused ? "Resume Channel" : "Pause Channel"}
                             </button>                            
                             <button onClick={ () => {this.props.removeChannel(c.id) } } >
                                Remove Channel
                             </button>
                         </div> 
                         ])})
                      }
                  </div>
                  <div name={"Display"} >
                      TODO
                  </div>
              </ChartControls>
        
        )
    }
    
    
    
    render() {
        let {id, textChannels, tileIDs} = this.props;
        console.log("Render textOutput");
            
        return (
            <div className="text-tile">
                TextOutput number: {id}
                <div className="textSeries">
                    {this.createTextChannels(textChannels)}
                </div>
                <div className="chartCtrl">
                    {this.createChartCtrl(textChannels, tileIDs)}
                </div>
            </div>
        );
    }

}

TextOutput.propTypes = {
    width:      PropTypes.number,
    height:     PropTypes.number,
    tileIDs:    PropTypes.array
}

TextOutput.defaultProps = {
    channel:    "",
    color: "black",
    width: 200,
    height: 100
}
