#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu May 18 14:11:23 2017

@author: jpoeppel
"""

from flask import Flask
from flask_socketio import SocketIO


app = Flask(__name__, static_folder="static/build/static", template_folder="static/build/")
app.config.from_object('config') #Will load config.py from root directory

socketio = SocketIO(app, engineio_logger=True)


from . import views