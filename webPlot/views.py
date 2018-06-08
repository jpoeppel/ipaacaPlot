#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu May 18 14:11:56 2017

@author: jpoeppel
"""

from flask import render_template

from . import app
from . import socketio
from . import io

try:
    import SocketServer as socketserver
except:
    import socketserver 

import atexit
import json

def update_data(iu, event_type, local):
    if event_type in ['ADDED', 'UPDATED', 'MESSAGE']:
        app.logger.info("Received message from channel {}, payload: {}".format(iu.category, iu.payload))
        payload = dict(iu.payload)
        payload["y"] = json.loads(payload["y"])
        payload["connection"] = "ipaaca:"+iu.category
        socketio.emit("update_data", payload)


def update_data_rsb(event):
    js = json.loads(event.data)
    js["connection"] = "rsb:"+event.scope.toString().strip("/")
    socketio.emit("update_data", js) 


def handle_zmq(msg):
    # app.logger.info("emitting to socketio: {}".format(msg))
    socketio.emit("update_data", msg)

class MyTCPStreamHandler(socketserver.StreamRequestHandler):
    
    def handle(self):
        try:
            chunk = self.rfile.readline().strip()
        except Exception as e:
            app.logger.error(str(e))
        app.logger.info("Received {} from {}".format(chunk, self.client_address))
        try:
            js = json.loads(chunk)
            js["connection"] = "tcp:"+str(self.server.server_address[1])
            socketio.emit("update_data", js)
            app.logger.info("emitted response")
        except json.decoder.JSONDecodeError:
            app.logger.debug("decoding error")

app.connection_manager = io.ConnectionManager()

app.connection_manager.add_connection("5057", handle_zmq, "zmq")

app.last_condition = None
app.logger.info("Finished setting up zmq")

@app.route('/') 
@app.route('/index')
def index():
    return render_template('index.html')
 

@socketio.on("add_connection")
def add_connection(connection):
    if ":" in connection:
        prot, connection = connection.split(":")
    else:
        app.logger.debug("Invalid connection specification: {}".format(connection))
        #TODO Trigger error in frontend!
        return
    
#        prot = "rsb"
#        connection = connection
    app.logger.info("adding channel: {}".format(connection))
    if prot == "rsb":
        app.connection_manager.add_connection(connection, update_data_rsb, prot)
    elif prot == "ipaaca":
        app.connection_manager.add_connection(connection, update_data, prot)
    elif prot == "tcp":
        app.connection_manager.add_connection(connection, MyTCPStreamHandler, prot)
    else:
        app.logger.debug("Ignoring invalid protocol ({})".format(prot))
    

@socketio.on("remove_connection")
def remove_connection(connection):
    app.logger.info("removing connection: {}".format(connection))
    app.connection_manager.remove_connection(connection)
    
@socketio.on('connect')
def connect(): 
    app.logger.info("client connected")

    modelstring = "zmq:5057"
    if app.connection_manager.connections[modelstring].ident:
        app.connection_manager.notify(modelstring, json.dumps({"conditionRequest": ""}))
    return 


@socketio.on("select_condition")
def select_condition(condition, runNr, condition_src):
    app.logger.info("selected condition {} run {}, src: {}".format(condition, runNr, condition_src))

    app.last_condition=condition
    app.connection_manager.notify(condition_src, json.dumps({"selection": {"condition": condition, "runNr": runNr}}))


@socketio.on("message")
def message(address, msg):
    msgObj = json.loads(msg)
    app.connection_manager.notify(address, json.dumps(msgObj))
