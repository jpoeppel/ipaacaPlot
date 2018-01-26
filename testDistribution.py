# -*- coding: utf-8 -*-
"""
Created on Sat Jun 24 00:45:04 2017

@author: Jan
"""

import numpy as np
import time
import rsb

import socket

import json

#informer = rsb.createInformer("/test")

#informer2 = rsb.createInformer("/bartest")

#import ipaaca

#ipaacaOutbuffer = ipaaca.OutputBuffer("IpaacaTest")




def client(ip, port, message):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((ip, port))
    sock.sendall(message)
    sock.close()

#sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#
#sock.connect(("localhost", 9001))

try:
    while True:
    
#        data = {"channel": "test", "y": list(np.random.rand(1))}
        data = {"y": np.random.rand(1)[0]}
        data["dist"] = list(np.random.rand(5))
#        print("Sending data: ", data)
#        informer.publishData(json.dumps(data))
        
        try:
            port = 9080
            client("localhost", port, json.dumps(data) + "\n")
        except:
            pass
        
        try:
            port = 9081
            client("localhost", port, json.dumps({"txt": np.random.choice(["a:1","b","c","d"])}) + "\n")
        except:
            pass
#        sock.close()
#        msg = ipaaca.Message("test")
#        msg.payload = {k: str(v) for k,v in data.items()}
        
#        ipaacaOutbuffer.add(msg)
        
#        data = {"channel":"bartest", "dist": list(np.random.rand(5))}
        
#        informer2.publishData(json.dumps(data))
        time.sleep(0.15)
except KeyboardInterrupt:
    pass
#    del informer
#    del ipaacaOutbuffer
