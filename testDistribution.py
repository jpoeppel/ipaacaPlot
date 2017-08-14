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

while True:
    
    data = {"y": list(np.random.rand(1))}
    print("Sending data: ", data)
    informer.publishData(json.dumps(data))
    
    time.sleep(0.2)