# -*- coding: utf-8 -*-
"""
Created on Sat Jun 24 00:00:38 2017
Abstracts multiple connection possibilities away.
@author: Jan
"""

from . import app


try:
    import ipaaca
    ipaacaAvailable = True
except (ImportError, SyntaxError):
    ipaacaAvailable = False
    
try:
    import rsb
    rsbAvailable = True
except (ImportError, SyntaxError):
    rsbAvailable = False

try:
    import zmq
    zmqAvailable = True
except (ImportError):
    zmqAvailable = False


import socket
import threading
from . import socketio


try:
    import SocketServer as socketserver
except:
    import socketserver    

import json

MAX_CONNECTIONS = 5

class Connection(object):
    
    pass
    
class IpaacaConnection(Connection):
    
    def __init__(self, callback, channel):
        self.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
        self.inputBuffer.register_handler(callback)
        #TODO do not create new buffers for each new category/channel
        self.inputBuffer.add_category_interests(channel)
        
        
class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass
        

# class MyTCPHandler(socketserver.BaseRequestHandler):
    
#     def handle(self):
#         chunk = self.request.recv(2048)
#         print("Received {} from {}".format(chunk, self.client_address))
        
        
# class MyTCPStreamHandler(socketserver.StreamRequestHandler):
    
#     def handle(self):
        
#         chunk = self.rfile.readline()
#         print("Received {} from {}".format(chunk, self.client_address))


class SocketConnection(Connection):
    
    def __init__(self, handler, port):
        
        serverName = "localhost" #socket.gethostname() if we need to allow different machines!
        app.logger.info("Setting up TCP server")
        self.server = ThreadedTCPServer((serverName, port), handler)
        
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        # Exit the server thread when the main thread terminates
        self.server_thread.daemon = True
        self.server_thread.start()
        app.logger.info("Finished setting up tcp server")

    def __del__(self):
        self.server.shutdown()
        self.server.server_close()
        
    
class RSBConnection(Connection):
    
    def __init__(self, callback, channel):
        self.listener = rsb.createListener(channel)
        self.listener.addHandler(callback)
        
    def __del__(self):
        self.listener.deactivate()
        del self.listener

class ZMQReply(object):
    def __init__(self, handler, port, protocol="tcp"):
        # serverName = "localhost"
        serverName = "127.0.0.1"
        self.port = port
        app.logger.info("Setting up ZMQ server")
        self.handler = handler
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.REP)
        self.socket.bind("{}://{}:{}".format(protocol, serverName, port))
        self.server_thread = threading.Thread(target=self.serve_forever)
        self.server_thread.daemon = True
        self.running = True
        app.logger.info("before thread start")
        self.server_thread.start()
        app.logger.info("after thread start")


    def serve_forever(self):
        while self.running:
            socketio.sleep(0.001)
            message = self.socket.recv()
            app.logger.info("zmqserver received: {}".format(message))
            self.socket.send_json("acknowledged")
            message = json.loads(message)
            message["connection"] = "zmq:{}".format(self.port)
            self.handler(message)


    def __del__(self):
        self.running = False
        self.socket.close()
        self.context.term()
        
        
class ConnectionManager(object):
    
    def __init__(self):
        app.logger.info("Init ConnectionManager")
        self.connections = {}
         
    def add_connection(self, channel, callback, protocol):
        channelID = protocol + ":" + channel
        app.logger.info("trying to add {}".format(channelID))
        if channelID in self.connections:
            #Connection already established, do nothing
            app.logger.info("channelID {} already included".format(channelID))
            return
        if protocol == "rsb" and rsbAvailable: 
            self.connections[channelID] = RSBConnection(callback, "/" + channel)
        elif protocol == "ipaaca" and ipaacaAvailable:
            self.connections[channelID] = IpaacaConnection(callback, channel)
        elif protocol == "tcp":
            #Use port as channel in the tcp case for now
            #The callback needs to be a HandlerClass!
            self.connections[channelID] = SocketConnection(callback, int(channel))
        elif protocol == "zmq":
            self.connections[channelID] = ZMQReply(callback, int(channel))
        else:
            app.logger.error("Could not add connection for protocol {}. Is this \
                             protocol available?".format(protocol))
            
    def remove_connection(self, channel):
        app.logger.info("removing connection for channel: {}".format(channel))
        app.logger.info("Currently contained channels: {}".format(self.connections.keys()))
        try:
#            self.connections[channel].listener.deactivate()
#            for handler in self.connections[channel].getHandlers():
#                self.connections[channel].removeHandler(handler)
            del self.connections[channel]
        except KeyError:
            app.logger.debug("Key error when removing channel: {}".format(channel))
            pass
        
    def clear(self):
        for con in list(self.connections.keys()):
            del self.connections[con]


    def __del__(self):
        app.logger.info("deconstructing connectionManager")
        self.clear()
        
def get_ipaaca_connection(callback):
    if ipaacaAvailable:
        return IpaacaConnection(callback)
    else:
        return None
    
    
if __name__ == "__main__":
    
    def dummyHandler(event):
        js = json.loads(event.data)
        print("Event: ", js)
    con = RSBConnection(dummyHandler, "/test")
    import time
    while True:
        time.sleep(0.1)