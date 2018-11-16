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
        this.sendMessage = this.sendMessage.bind(this);
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


        console.log("send adding message")
        let addFunction = {
            type: "ADD_MSG_FNC",
            payload: this.sendMessage
        }
        this.props.dispatch(addFunction);
        
    }

    sendMessage(channel, message){
        this.socket.emit("message", channel,
                        JSON.stringify(message))
    }



    updateData(msg) {
        // console.log("Received Message: ", msg);
        // console.log("this.state in update: ", this.state);
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
        if (shouldLog === null) {
            return;
        }
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
        console.log("add connection: ", connectionInfo);
        if (channel !== "internal") {
            this.socket.emit("add_connection", channel);
        }

        let newChannels = {...this.state.channels};
        if (newChannels[channel]) {
            newChannels[channel] = newChannels[channel].concat(connectionInfo.dataKeys);
        } else {
            newChannels[channel] = connectionInfo.dataKeys
        }

        //This should not be done, but otherwise, state is not updated
        //quick enough...
        this.state = {...this.state,
            channels: newChannels
        }
        //For some reason we still seem to need this for anything to happen...
        this.setState(this.state);
    }

    removeConnection(connection, dataKeys) {
        let cleanAction = {
            type: "CLEAN_CHANNEL",
            channel: connection,
            dataKeys: dataKeys
        }
        this.props.dispatch(cleanAction);


        let newChannels = {...this.state.channels};
        let channel = newChannels[connection].filter( c => {
            for (var i=0; i<dataKeys.length; i++) {
                let key = dataKeys[i];
                if (c.val !== key.val) {
                    return c
                }
            }
        })

        newChannels[connection] = channel;
        if (channel.length === 0) {
            this.socket.emit("remove_connection", connection);
        }

        //This should not be done, but otherwise, state is not updated
        //quick enough...
        this.state = {...this.state,
            channels: newChannels
        }
        //For some reason we still seem to need this for anything to happen...
        this.setState(this.state);
    }

    render() {
        return null
    }

}

export const SocketConnectionStore = connect(null, mapDispatchToProps)(SocketConnection)