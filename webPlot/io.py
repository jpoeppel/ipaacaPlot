# -*- coding: utf-8 -*-
"""
Created on Sat Jun 24 00:00:38 2017
Abstracts multiple connection possibilities away.
@author: Jan
"""

try:
    import ipaaca
    ipaacaAvailable = True
except ImportError:
    ipaacaAvailable = False
    
try:
    import rsb
    rsbAvailable = True
except ImportError:
    rsbAvailable = False
    
import json

class Connection(object):
    
    pass
    
class IpaacaConnection(Connection):
    
    def __init__(self, callback):
        self.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
        self.inputBuffer.register_handler(callback)
        
        
class SocketConnection(Connection):
    
    def __init__(self, callback):
        pass
    
class RSBConnection(Connection):
    
    def __init__(self, callback, channel):
        self.listener = rsb.createListener(channel)
        self.listener.addHandler(callback)
        
        
class ConnectionManager(object):
    
    def __init__(self):
        self.connections = {}
        
    def add_connection(self, channel, callback, protocol):
        if protocol == "rsb":
            self.connections[channel] = RSBConnection(callback, "/" + channel)
            
    def remove_connection(self, channel):
        try:
            self.connections[channel].deactivate()
            del self.connections[channel]
        except KeyError:
            pass
        
        
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