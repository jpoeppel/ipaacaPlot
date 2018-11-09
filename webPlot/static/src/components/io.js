import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import io from "socket.io-client";


function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch
    }
}

export default class SocketConnection extends Component {
    constructor(store) {
        super()

        this.state = {
            channels: {}
        }

        this.updateData = this.updateData.bind(this);
        this.addConnection = this.addConnection.bind(this);
        this.removeConnection = this.removeConnection.bind(this);
        this._updateStore = this._updateStore.bind(this);

        // let connection = "tcp:9080";
        // this.socket.emit("add_connection", connection);
    }

    componentDidMount() {
        this.socket = io.connect("http://localhost:5000", {transport:["websocket"]});
        
        this.socket.on("connect", function() {
            console.log("Connected");
        });
        
        this.socket.on("update_data", this.updateData);


        this.props.addConnection(this.addConnection);
        this.props.removeConnection(this.removeConnection);
        
    }

    updateData(msg) {
        console.log("Received Message: ", msg)
        let channel = msg.connection;
        if (channel in this.state.channels) {
            let channelConfig = this.state.channels[channel];
            for (var i=0; i<channelConfig.length; i++) {
                let dataKey = channelConfig[i].val;
                let shouldLog = channelConfig[i].log;
                if (dataKey in msg) {
                    this._updateStore(channel, dataKey, msg[dataKey], shouldLog)
                } else {
                    //Ignore
                }
            }
        }
    }

    _updateStore(channel, dataKey, payload, shouldLog) {
        let updateAction = {
            type: shouldLog ?  "UPDATE_CHANNEL_ADD" : "UPDATE_CHANNEL_REPLACE",
            channel: channel,
            dataKey: dataKey,
            payload: payload,
        }
        this.props.dispatch(updateAction);
    }

    addConnection(connectionInfo) {
        let channel = connectionInfo.channel

        this.socket.emit("add_connection", channel);

        let newChannels = {...this.state.channels};
        // if (channel in newChannels) {
            // newChannels[channel].push(connectionInfo.dataKey)
        //     let channelConfig = newChannels[channel];
        //     for (var i=0; i<channelConfig.length; i++) {
        //         if (channelConfig[i].val == connectionInfo.)
        //     }
        // }
        newChannels[channel] = connectionInfo.dataKeys
        this.setState({
            channels: newChannels
        })
    }

    removeConnection(connection) {
        this.socket.emit("remove_connection", connection);
    }

    render() {
        return null
    }

}

export const SocketConnectionStore = connect(null, mapDispatchToProps)(SocketConnection)