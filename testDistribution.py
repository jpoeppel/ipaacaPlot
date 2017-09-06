# -*- coding: utf-8 -*-
"""
Created on Sat Jun 24 00:45:04 2017

@author: Jan
"""

import numpy as np
import time
import rsb

import json

informer = rsb.createInformer("/test")

informer2 = rsb.createInformer("/bartest")

try:
    while True:
    
        data = {"channel": "test", "y": list(np.random.rand(1))}
        print("Sending data: ", data)
        informer.publishData(json.dumps(data))
        
        
        data = {"channel":"bartest", "dist": list(np.random.rand(5))}
        
        informer2.publishData(json.dumps(data))
        time.sleep(0.15)
except KeyboardInterrupt:
    del informer