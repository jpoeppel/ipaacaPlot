#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Thu Nov 23 16:09:57 2017

@author: jpoeppel
"""

import socket
import time
import threading 

try:
    import SocketServer as socketserver
except:
    import socketserver

servername = "localhost"

class SocketClient(object):
    
    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
    def connect(self, host, port):
        print("Trying to connect")
        self.sock.connect((host,port))
        
    def send(self, msg):
        sent = self.sock.send(bytes(msg, "utf-8"))
        print("send {} bytes".format(sent))
        
        self.sock.close()
        
    # def __del__(self):
        # self.sock.shutdown(socket.SHUT_RDWR)
        # self.sock.close()
    
class MyTCPHandler(socketserver.BaseRequestHandler):
    
        def handle(self):
            chunk = self.request.recv(2048)
            print("Received {} from {}".format(chunk, self.client_address))
            
            
class MyTCPStreamHandler(socketserver.StreamRequestHandler):
    
    def handle(self):
        
        chunk = self.rfile.readline()
        print("Received {} from {}".format(chunk, self.client_address))
            
class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass
        
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
            print("Listening for connections", self.running)
            try:
                s.settimeout(2)
                conn, addr = s.accept()
            except socket.timeout:
                print("No connection")
                pass
            else:
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
        print("After join")
        
    def __del__(self):
        self.shutdown()
            
if __name__ == "__main__":
    
    
    port = 8082
    # port = 9080
    
#    server = SocketServer(port)
    server = ThreadedTCPServer((servername, port), MyTCPHandler)
    # Start a thread with the server -- that thread will then start one
    # more thread for each request
    server_thread = threading.Thread(target=server.serve_forever)
    # Exit the server thread when the main thread terminates
    server_thread.daemon = True
    server_thread.start()
    
    
    
    while True:
        # client = SocketClient()
        # client.connect(servername, port)
        # client.send("testmsg asdas")
        print("sleeping")
        time.sleep(0.1)
    
    
    server.shutdown()
    server.server_close()
    print("after server close")
