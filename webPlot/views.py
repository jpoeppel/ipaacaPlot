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

#import ipaaca

import json

def update_data(iu, event_type, local):
    if event_type in ['ADDED', 'UPDATED', 'MESSAGE']:
#        app.logger.info("Received message from channel {}, payload: {}".format(iu.category, iu.payload))
        socketio.emit("update_data", iu.payload)


def update_data_rsb(event):
    js = json.loads(event.data)
    socketio.emit("update_data", js) 

#app.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
#app.inputBuffer.register_handler(update_data)

app.connectionManager = io.ConnectionManager()


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
    app.logger.info("adding channel: {}".format(channel))
    app.connectionManager.add_connection(channel, update_data_rsb, "rsb")
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