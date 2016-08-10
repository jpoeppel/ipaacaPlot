# -*- coding: utf-8 -*-
"""
A simple ipaaca hanlder that allows to register/unregister to interesting input categories
as well as send messages to a specified category.

@author: jpoeppel
Last modified: 17.12.14
"""

import ipaaca


class IpaacaHandler(object):
    """ Ipaaca interface that allows the publishing and recieving of data via ipaaca.
    """

    def __init__(self, component, inputCategories=[], callback = None):
      """
        Contructor for the ipaaca interface
        
        @param component: The name of the component using this handler
        @param inputCategories: (Optional) List of categories this interface should listen to 
        @param callbackHandler: (Optional) Handler function that is to be called when interesting messages are recieved.
                          Needs to have the following interface: updateHandler(iu, event_type, local):
      """
      self.inputCategories = inputCategories
      self.callback = callback
      self.component = component
      self.callbackSet = False
      # output and input buffers with ipaaca module name
      self.outBuffer = ipaaca.OutputBuffer(self.component)
      # input buffer with a list of categories that this module is listening for
      if len(self.inputCategories) > 0:
        self.inBuffer = ipaaca.InputBuffer(self.component, self.inputCategories)
        # register this module's update handler, so that received IUs can be processed
        if self.callback != None:
          self.inBuffer.register_handler(self.callback)      
      else:
        self.inBuffer = None
        
    def publish(self, category, payload):
      """
        Publishing method that sends a message of given kategory and payload.
        
        @param category: The category this message should have
        @param payload: A dictionary containing the payload as key-value pairs
      """
      msg = ipaaca.Message(category)
      msg.payload = payload
      self.outBuffer.add(msg)
      
    def setCallback(self, callback):
      """
        Function to set the callback function that is to be triggered by the inBuffer.
        
        @param callback: Function handle that is used for the callbacks.
      """
      self.callback = callback
      if len(self.inputCategories) > 0:
        if self.callback != None:
          self.inBuffer.register_handler(self.callback)  
          
        
    def addInputCategory(self, category):
      """
        Function that allows to add a category to the interesting categories of the 
        inBuffer.
        
        @param category: The category name that is to be added.
      """
      
      print "adding category", category
      if category not in self.inputCategories:
        self.inputCategories.append(category)
      if len(self.inputCategories) > 0:
        if self.inBuffer != None:
          self.inBuffer.add_category_interests([category])
        else:
          self.inBuffer = ipaaca.InputBuffer(self.component, self.inputCategories)
        # register this module's update handler, so that received IUs can be processed
        if self.callback != None and not self.callbackSet:
          self.inBuffer.register_handler(self.callback)  
          self.callbackSet =  True
          
    def removeInputCategory(self, category):
      """
        Function to remove a category from the list of interesting categories the
        inputBuffer listens to.
        
        Manipulates lower level variables since there is no direct access.
        
        @param category: The category name that is to be removed.
      """
      print "Removing category", category
      if category in self.inputCategories:
        self.inputCategories.remove(category)
        del self.inBuffer._listener_store[category]
        self.inBuffer._category_interests.remove(category)
      if len(self.inputCategories) == 0:
        self.inBuffer = None


if __name__ == "__main__":
  
  import sys
  
  handler = IpaacaHandler("BasicIpaacaDummy", [], None)
  
  print "Input Category:"
  cat = sys.stdin.readline().replace('\n','')
  print "Inserted Category: ", cat
  try:
    print "Input 'key:value' to send an ipaaca message containing the data as payload"
    while True:
      payload = sys.stdin.readline().replace('\n','').split(':')
      print "Sending: ", payload
      handler.publish(cat, {payload[0].strip():payload[1].strip()})
  except:
    sys.exit(0)
  