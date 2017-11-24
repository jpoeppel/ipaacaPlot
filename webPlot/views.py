#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu May 18 14:11:56 2017

@author: jpoeppel
"""

from flask import render_template, send_from_directory

from . import app
from . import socketio
from . import io

import os

try:
    import SocketServer as socketserver
except:
    import socketserver 


import json

def update_data(iu, event_type, local):
    if event_type in ['ADDED', 'UPDATED', 'MESSAGE']:
        app.logger.info("Received message from channel {}, payload: {}".format(iu.category, iu.payload))
        payload = dict(iu.payload)
        payload["y"] = json.loads(payload["y"])
        payload["channel"] = "ipaaca:"+iu.category
        socketio.emit("update_data", payload)


def update_data_rsb(event):
    js = json.loads(event.data)
    js["channel"] = "rsb:"+event.scope.toString().strip("/")
    socketio.emit("update_data", js) 


class MyTCPStreamHandler(socketserver.StreamRequestHandler):
    
    def handle(self):
        try:
            chunk = self.rfile.readline().strip()
        except Exception as e:
            app.logger.error(str(e))
        app.logger.info("Received {} from {}".format(chunk, self.client_address))
        js = json.loads(chunk)
        js["channel"] = "tcp:"+str(self.server.server_address[1])
        socketio.emit("update_data", js)
        app.logger.info("emitted response")

#app.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
#app.inputBuffer.register_handler(update_data)

app.connectionManager = io.ConnectionManager()
#app.connectionManager.add_connection("8092", MyTCPStreamHandler, "tcp")

@app.route('/') 
@app.route('/index')
def index():
    return render_template('index.html')
 
#@app.route('/favicon.ico')
#def serve():
#    if os.path.exists("static/build/favicon.ico"):
#        return send_from_directory("static/build/favicon.ico")
#    else:
#        return render_template("index.html")


@socketio.on("add_channel")
def add_channel(channel):
    if ":" in channel:
        prot, channel = channel.split(":")
    else:
        prot = "rsb"
        channel = channel
    app.logger.info("adding channel: {}".format(channel))
    if prot == "rsb":
        app.connectionManager.add_connection(channel, update_data_rsb, prot)
    elif prot == "ipaaca":
        app.connectionManager.add_connection(channel, update_data, prot)
    elif prot == "tcp":
        app.connectionManager.add_connection(channel, MyTCPStreamHandler, prot)
#    app.inputBuffer.add_category_interests(channel)
    

@socketio.on("remove_channel")
def remove_channel(channel):
    app.logger.info("removing channel: {}".format(channel))
    app.connectionManager.remove_connection(channel)
#    app.inputBuffer.remove_category_interests(channel)
    
@socketio.on('connect')
def connect(): 
    app.logger.info("client connected")
    return 