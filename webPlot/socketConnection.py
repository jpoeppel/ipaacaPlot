#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Thu Nov 23 16:09:57 2017

@author: jpoeppel
"""

import socket
import time
import threading 


servername = "localhost"

class SocketClient(object):
    
    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
    def connect(self, host, port):
        print("Trying to connect")
        self.sock.connect((host,port))
        
    def send(self, msg):
        sent = self.sock.send(msg)
        print("send {} bytes".format(sent))
        
    def __del__(self):
        self.sock.shutdown(socket.SHUT_RDWR)
        self.sock.close()
    
    
class SocketServer(object):
    
    def __init__(self, port):
        
        self.host = servername
        self.port = port
        self.running = True
        
        self.serveThread = threading.Thread(target=self.serve)
        self.serveThread.daemon = True
        self.serveThread.start()
        
        
    def serve(self):
        
        s =  socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.bind((self.host, self.port))
        s.listen(5)
        
        while self.running:
            print("Listening for connections")
            
            conn, addr = s.accept()
            chunk = conn.recv(2048)
            print("Received {} from {}".format(chunk, addr))
            conn.shutdown(socket.SHUT_RDWR)
            conn.close()
            
#            time.sleep(0.1)
        s.shutdown(socket.SHUT_RDWR)
        s.close()
            
    def shutdown(self):
        print("Cleaning up server socket")
        self.running = False
        self.serveThread.join()
            
if __name__ == "__main__":
    
    
    port = 8081
    
    server = SocketServer(port)
    
    client = SocketClient()
    client.connect(servername, port)
    
    client.send("testmsg asdas")
    
    time.sleep(0.1)
    del client
    server.shutdown()
    print("after shutdown")
    del server