#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu May 18 14:11:56 2017

@author: jpoeppel
"""

from flask import render_template

from . import app
from . import socketio

import ipaaca


def update_data(iu, event_type, local):
    if event_type in ['ADDED', 'UPDATED', 'MESSAGE']:
        app.logger.info("Received message from channel {}, payload: {}".format(iu.category, iu.payload))
        socketio.emit("update_data", iu.payload)

app.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
app.inputBuffer.register_handler(update_data)
app.inputBuffer.add_category_interests("test")

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')