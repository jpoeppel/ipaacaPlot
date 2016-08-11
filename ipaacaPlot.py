#!/usr/bin/env python
# encoding: utf-8
"""
Minimal GUI for Ipaaca Plot Visualisation.
Allows to add several channels (ipaaca topcis) to listen to and plot the raw float
data. However, it does not further processing of the messages other than trying to
extract floats from it.
@author: jpoeppel
Last Modified: 17.12.14

10.08.2016
Fixed a bug that caused ipaaca to crash
"""
import os
import wx
import sys
import ipaacaHandler
import time
import threading
# The recommended way to use wx with mpl is with the WXAgg
# backend. 
#
import matplotlib
matplotlib.use('WXAgg')
from matplotlib.figure import Figure
from matplotlib.backends.backend_wxagg import \
    FigureCanvasWxAgg as FigCanvas, \
    NavigationToolbar2WxAgg as NavigationToolbar
import numpy as np
import pylab

class ParameterChangerBox(wx.Panel):
  """
    A static combination of Label and Entry/CheckBox that allows to update parameters 
  """
  
  def __init__(self, parent, ID, label, initVal):
      wx.Panel.__init__(self,parent, ID)
      self.value = initVal
    
    
class DistributionChannelBox(wx.Panel):
    """
        A static box taht allows to add another ipaaca category over which a distribution
        is send.
    """
    
    def __init__(self, parent, ID, ctrl):
        wx.Panel.__init__(self, parent, ID)
        
        self.ctrl = ctrl
        self.category = ""
        self.xKey = "x"
        self.yKey = "y"
        self.xData = []
        self.yData = []
        self.title = ""
        self.minVal = 0.0
        self.maxVal = 0.0
        self.xMin = -1
        self._isActive = False
        self.colour = (0,0,0)
        self.dataLock = threading.Lock()
        self.plot_data = ctrl.axes.plot([], linewidth=1,color=self.colour,marker="*", linestyle="")[0]
        
        self.activeCB = wx.CheckBox(self, -1, "Active")
        self.activeCB.SetValue(self._isActive)
        self.activeCB.Bind(wx.EVT_CHECKBOX, self.on_checkActive)
        
        box = wx.StaticBox(self, -1, "Add Distribution Channel")
        sizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        
        catLabel = wx.StaticText(self, -1, "Category: ")
        self.catText = wx.TextCtrl(self, -1, "", size=(100,-1))

        self.catText.Bind(wx.EVT_TEXT_ENTER, self.on_catText_enter)   
        self.catText.Bind(wx.EVT_KILL_FOCUS, self.on_catText_enter)
        
        category_box = wx.BoxSizer(wx.HORIZONTAL)
        category_box.Add(catLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        category_box.Add(self.catText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(self, -1, "X Key: ")
        self.xKeyText = wx.TextCtrl(self, -1, self.xKey, size=(100,-1))
        
        self.xKeyText.Bind(wx.EVT_TEXT_ENTER, self.on_xKeyText_enter)         
        self.xKeyText.Bind(wx.EVT_KILL_FOCUS, self.on_xKeyText_enter)
        
        x_key_box = wx.BoxSizer(wx.HORIZONTAL)
        x_key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        x_key_box.Add(self.xKeyText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(self, -1, "Y Key: ")
        self.yKeyText = wx.TextCtrl(self, -1, self.yKey, size=(100,-1))
        
        self.yKeyText.Bind(wx.EVT_TEXT_ENTER, self.on_yKeyText_enter)         
        self.yKeyText.Bind(wx.EVT_KILL_FOCUS, self.on_yKeyText_enter)
        
        y_key_box = wx.BoxSizer(wx.HORIZONTAL)
        y_key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        y_key_box.Add(self.yKeyText, flag=wx.ALIGN_CENTER_VERTICAL)

        self.colourPicker = wx.ColourPickerCtrl(self, -1)
        
        self.colourPicker.Bind(wx.EVT_COLOURPICKER_CHANGED, self.on_colourChange)
        
#        self.clear_button = wx.Button(self, -1, "Clear")
#        self.Bind(wx.EVT_BUTTON, self.on_clear_button, self.clear_button)
        
        self.remove_button = wx.Button(self, -1, "Remove")
        self.Bind(wx.EVT_BUTTON, self.on_remove_button, self.remove_button)
        
        styles = ['-','*','.','--', ':', 'd']
        self.lineStyleCB = wx.ComboBox(self, value='*', size=(60, 30), choices=styles, 
            style=wx.CB_READONLY)
        self.lineStyleCB.Bind(wx.EVT_COMBOBOX, self.on_StyleSelect)
        
        sizer.Add(category_box, 0, wx.ALL, 10)
        sizer.Add(x_key_box, 0, wx.ALL, 10)
        sizer.Add(y_key_box, 0, wx.ALL, 10)
        hbox = wx.BoxSizer(wx.HORIZONTAL)
        hbox.Add(self.colourPicker, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox.Add(self.lineStyleCB, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        
        
        sizer.Add(hbox, 0, wx.ALL, 10)

        hbox2 = wx.BoxSizer(wx.HORIZONTAL)
#        hbox2.Add(self.clear_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox2.Add(self.remove_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)        
        sizer.Add(hbox2, 0, wx.ALL, 10)
        sizer.Add(self.activeCB, 0, wx.ALL, 10)
        
        self.SetSizer(sizer)
        sizer.Fit(self)
        self.catText.SetFocus()
        
    @property
    def isActive(self):
        return (self._isActive and len(self.yData) > 0)
        
        
    @isActive.setter
    def isActive(self, value):
        self._isActive = value
        self.activeCB.SetValue(value)
        
    def on_StyleSelect(self, event):
        style = event.GetString()
        if style in ['*','.','d']:
            pylab.setp(self.plot_data, linestyle= '')
            pylab.setp(self.plot_data, marker= style)
        else:
            pylab.setp(self.plot_data, linestyle= style)
            pylab.setp(self.plot_data, marker= '')
      
    def on_catText_enter(self, event):
        self.category = self.catText.GetValue()
        
    def on_colourChange(self, event):
        col=self.colourPicker.GetColour()
        self.colour = (float(col[0])/255,float(col[1])/255,float(col[2])/255)
        pylab.setp(self.plot_data, color=self.colour)
   
    def on_xKeyText_enter(self, event):
        self.xKey = self.xKeyText.GetValue()
        
    def on_yKeyText_enter(self, event):
        self.yKey = self.yKeyText.GetValue()
        
    def on_remove_button(self,event):
        self.remove_button.Unbind(wx.EVT_BUTTON)
        
        if self.plot_data in self.ctrl.axes.lines:
            self.ctrl.axes.lines.remove(self.plot_data)
            self.ctrl.removeChannel(self)
    
    def updatePlotData(self):
        if self._isActive:
            with self.dataLock:
#              self.plot_data.set_xdata(np.array(self.xData)) 
              self.plot_data.set_xdata(np.arange(len(self.xData)))  
              self.plot_data.set_ydata(np.array(self.yData))      
              self.ctrl.axes.set_xticks(np.arange(len(self.xData)))
              self.ctrl.axes.set_xticklabels(self.xData)
#              self.plot_data.set_xdata(np.array([1])) 
#              self.plot_data.set_ydata(np.array([1]))  

            pylab.setp(self.ctrl.axes, title=self.title)
        
    def on_checkActive(self, event):       
        sender = event.GetEventObject()
        isChecked = sender.GetValue()
        self.isActive = isChecked
        if self._isActive:
            self.ctrl.ih.addInputCategory(self.category)
            if self.plot_data not in self.ctrl.axes.lines:
                self.ctrl.axes.lines.append(self.plot_data)
            
        else:
            if self.plot_data in self.ctrl.axes.lines:
                self.ctrl.axes.lines.remove(self.plot_data)
          #self.ctrl.canvas.draw()
            
#    def addData(self, timestamp, data):
#        self.lastData = timestamp
#        with self.dataLock:
#            self.times.append(timestamp)
#            self.data.append(data)
            
    def updateData(self, firstTimestamp, payload):
        
        try:
            xData = list(payload[self.xKey])
            yData = list(payload[self.yKey])
            self.maxVal = max(yData)
            self.minVal = min(yData)
            with self.dataLock:
                self.xData = xData
                self.yData = yData
            self.lastData = len(self.xData)
        except KeyError:
            self.ctrl.prepFlashMessage = "Invalid key(s) (xKey: {}, yKey: {}) for category: {}. Channel will be disabled".format(self.xKey, self.yKey, self.category)
            self.ctrl.disableChannelBuffer = self
        if "title" in payload:
            self.title = payload["title"]
        
    
class ChannelBox(wx.Panel):
    """
        A static box that allows to add another ipaaca categorie and key where from
        where data can be recieved. Will also be used to store the data belonging to that channel.
    """
    
    def __init__(self, parent, ID, ctrl):
        wx.Panel.__init__(self, parent, ID)
        self.ctrl = ctrl
        self.category = ""
        self.key = ""
        self.data = []
        self.times = []
        self.lastData = 0
        self.colour = (0,0,0)
        self._isActive = False
        self.minVal = 0.0
        self.maxVal = 0.0
        self.xMin = 0
        self.dataLock = threading.Lock()
        self.plot_data = ctrl.axes.plot([], linewidth=1,color=self.colour,)[0]
        
        self.activeCB = wx.CheckBox(self, -1, "Active")
        self.activeCB.SetValue(self._isActive)
        self.activeCB.Bind(wx.EVT_CHECKBOX, self.on_checkActive)        
        
        box = wx.StaticBox(self, -1, "Add Channel")
        sizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        
        catLabel = wx.StaticText(self, -1, "Category: ")
        self.catText = wx.TextCtrl(self, -1, "", size=(100,-1))

        self.catText.Bind(wx.EVT_TEXT_ENTER, self.on_catText_enter)   
        self.catText.Bind(wx.EVT_KILL_FOCUS, self.on_catText_enter)
        
        category_box = wx.BoxSizer(wx.HORIZONTAL)
        category_box.Add(catLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        category_box.Add(self.catText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(self, -1, "Payload Key: ")
        self.keyText = wx.TextCtrl(self, -1, "", size=(100,-1))
        
        self.keyText.Bind(wx.EVT_TEXT_ENTER, self.on_keyText_enter)         
        self.keyText.Bind(wx.EVT_KILL_FOCUS, self.on_keyText_enter)
        
        key_box = wx.BoxSizer(wx.HORIZONTAL)
        key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        key_box.Add(self.keyText, flag=wx.ALIGN_CENTER_VERTICAL)

        self.colourPicker = wx.ColourPickerCtrl(self, -1)
        
        self.colourPicker.Bind(wx.EVT_COLOURPICKER_CHANGED, self.on_colourChange)
        
        self.clear_button = wx.Button(self, -1, "Clear")
        self.Bind(wx.EVT_BUTTON, self.on_clear_button, self.clear_button)
        
        self.remove_button = wx.Button(self, -1, "Remove")
        self.Bind(wx.EVT_BUTTON, self.on_remove_button, self.remove_button)
        
        styles = ['-','*','.','--', ':', 'd']
        self.lineStyleCB = wx.ComboBox(self, value='-', size=(60, 30), choices=styles, 
            style=wx.CB_READONLY)
        self.lineStyleCB.Bind(wx.EVT_COMBOBOX, self.on_StyleSelect)
        
        sizer.Add(category_box, 0, wx.ALL, 10)
        sizer.Add(key_box, 0, wx.ALL, 10)
        hbox = wx.BoxSizer(wx.HORIZONTAL)
        hbox.Add(self.colourPicker, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox.Add(self.lineStyleCB, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        
        
        sizer.Add(hbox, 0, wx.ALL, 10)

        hbox2 = wx.BoxSizer(wx.HORIZONTAL)
        hbox2.Add(self.clear_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox2.Add(self.remove_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)        
        sizer.Add(hbox2, 0, wx.ALL, 10)
        sizer.Add(self.activeCB, 0, wx.ALL, 10)
        
        self.SetSizer(sizer)
        sizer.Fit(self)
        self.catText.SetFocus()
        
        
    @property
    def isActive(self):
        return (self._isActive and len(self.data) > 0)
        
        
    @isActive.setter
    def isActive(self, value):
        self._isActive = value
        self.activeCB.SetValue(value)
      
      
    def on_StyleSelect(self, event):
        style = event.GetString()
        if style in ['*','.','d']:
            pylab.setp(self.plot_data, linestyle= '')
            pylab.setp(self.plot_data, marker= style)
        else:
            pylab.setp(self.plot_data, linestyle= style)
            pylab.setp(self.plot_data, marker= '')
      
    def on_catText_enter(self, event):
        self.category = self.catText.GetValue()
        
    def on_colourChange(self, event):
        col=self.colourPicker.GetColour()
        self.colour = (float(col[0])/255,float(col[1])/255,float(col[2])/255)
        pylab.setp(self.plot_data, color=self.colour)
   
    def on_keyText_enter(self, event):
        self.key = self.keyText.GetValue()
        
    def on_clear_button(self, event):
        self.data = []
        self.times = []
        self.lastData = 0
        self.maxVal = 0.0
        self.minVal = 0.0
      
    def on_remove_button(self,event):
        self.remove_button.Unbind(wx.EVT_BUTTON)
        if self.plot_data in self.ctrl.axes.lines:
            self.ctrl.axes.lines.remove(self.plot_data)
        self.ctrl.removeChannel(self)
        
    def updatePlotData(self):
        if self._isActive:
            with self.dataLock:
              self.plot_data.set_xdata(np.array(self.times)) 
              self.plot_data.set_ydata(np.array(self.data))        
        
    def on_checkActive(self, event):       
        sender = event.GetEventObject()
        isChecked = sender.GetValue()
        self.isActive = isChecked
        if self._isActive:
            self.ctrl.ih.addInputCategory(self.category)
            if self.plot_data not in self.ctrl.axes.lines:
                self.ctrl.axes.lines.append(self.plot_data)
        else:
            if self.plot_data in self.ctrl.axes.lines:
                self.ctrl.axes.lines.remove(self.plot_data)
          #self.ctrl.canvas.draw()
            
            
    def addData(self, timestamp, data):
      self.lastData = timestamp
      self.maxVal = max(self.maxVal, data)
      self.minVal = min(self.minVal, data)
      with self.dataLock:
          self.times.append(timestamp)
          self.data.append(data)
        
    def updateData(self, firstTimestamp, payload):
        timestamp = time.time()-firstTimestamp
        try:
            data = payload[self.key]
            self.addData(timestamp, data)
        except KeyError:
            self.ctrl.prepFlashMessage = "Invalid key ({}) for category: {}. Channel will be disabled".format(self.key, self.category)
            self.ctrl.disableChannelBuffer = self
      


class GraphFrame(wx.Frame):
    """ The main frame of the application
    """
    title = 'Ipaaca Plot Visualisation.'
    
    def __init__(self, ipaacaHandler):
        wx.Frame.__init__(self, None, -1, self.title)
        self.ih = ipaacaHandler
        self.ih.setCallback(self.updateData)
        #self.data = [1]
        self.channels = []
        self.paused = False
        self.firstTime = None
        
        self.create_menu()
        self.create_status_bar()
        self.create_main_panel()
        
        self.redraw_timer = wx.Timer(self)
        self.Bind(wx.EVT_TIMER, self.on_redraw_timer, self.redraw_timer)        
        self.redraw_timer.Start(100)
        self.Bind(wx.EVT_CLOSE, self._when_closed)
        
        self.prepFlashMessage = None
        self.disableChannelBuffer = None
        
    def _when_closed(self, event):
        self.redraw_timer.Destroy()
        sys.exit(0)
        
    def updateData(self, iu, event_type, local):
        if self.firstTime == None:
            self.firstTime = time.time()
        if event_type in ['ADDED', 'UPDATED', 'MESSAGE']:
            category = iu.category
            for channel in self.channels:
                if channel._isActive and channel.category == category:
                    channel.updateData(self.firstTime, iu.payload)

    def create_menu(self):
        self.menubar = wx.MenuBar()
        
        menu_file = wx.Menu()
        m_expt = menu_file.Append(-1, "&Save plot\tCtrl-S", "Save plot to file")
        self.Bind(wx.EVT_MENU, self.on_save_plot, m_expt)
        menu_file.AppendSeparator()
        m_exit = menu_file.Append(-1, "E&xit\tCtrl-X", "Exit")
        self.Bind(wx.EVT_MENU, self.on_exit, m_exit)
                
        self.menubar.Append(menu_file, "&File")
        self.SetMenuBar(self.menubar)

    def create_main_panel(self):
        self.panel = wx.Panel(self)

        self.init_plot()
        self.canvas = FigCanvas(self.panel, -1, self.fig)
        
        self.toolbar = NavigationToolbar(self.canvas)
        
        self.toolbar.Realize()
        self.toolbar.DeleteToolByPos(7) #Deletes the adjust subplots button
        self.toolbar.DeleteToolByPos(2) #Deletes the forward button
        self.toolbar.DeleteToolByPos(1) #Deletes the backward button
        self.toolbar.DeleteToolByPos(0) #Deletes the home button
        
        self.pause_button = wx.Button(self.panel, -1, "Pause")
        self.Bind(wx.EVT_BUTTON, self.on_pause_button, self.pause_button)
        self.Bind(wx.EVT_UPDATE_UI, self.on_update_pause_button, self.pause_button)
        
        self.cb_grid = wx.CheckBox(self.panel, -1, "Show Grid", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_grid, self.cb_grid)
        self.cb_grid.SetValue(True)
        
        self.cb_xlab = wx.CheckBox(self.panel, -1, "Show X labels", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_xlab, self.cb_xlab)        
        self.cb_xlab.SetValue(True)

        self.cb_x_window = wx.CheckBox(self.panel, -1, "Fixed X window", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_window, self.cb_x_window)        
        self.cb_x_window.SetValue(False)        
        
        self.cb_y_window = wx.CheckBox(self.panel, -1, "Fixed Y window", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_window, self.cb_y_window)        
        self.cb_y_window.SetValue(False)   
        
        self.addChannel_button = wx.Button(self.panel, -1, "Add Channel")
        self.Bind(wx.EVT_BUTTON, self.on_addChannel_button, self.addChannel_button)
        
        self.addDistChannel_button = wx.Button(self.panel, -1, "Add Distribution Channel")
        self.Bind(wx.EVT_BUTTON, self.on_addDistChannel_button, self.addDistChannel_button)
        
        self.clearAll_button = wx.Button(self.panel, -1, "Clear all")
        self.Bind(wx.EVT_BUTTON, self.on_clearAll_button, self.clearAll_button)

        
        self.hbox1 = wx.BoxSizer(wx.HORIZONTAL)
        self.hbox1.Add(self.pause_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.AddSpacer(20)
        self.hbox1.Add(self.cb_grid, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.AddSpacer(10)
        self.hbox1.Add(self.cb_xlab, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.AddSpacer(10)
        self.hbox1.Add(self.cb_x_window, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.AddSpacer(10)
        self.hbox1.Add(self.cb_y_window, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.AddSpacer(10)
        self.hbox1.Add(self.addChannel_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.Add(self.addDistChannel_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hbox1.Add(self.clearAll_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        
        self.hbox2 = wx.BoxSizer(wx.HORIZONTAL)
        
#        self.scrolled_panel = scrolled.ScrolledPanel(self.panel, -1, style = wx.TAB_TRAVERSAL|wx.SUNKEN_BORDER, name="panel1")
#        self.scrolled_panel.SetAutoLayout(1)
#        self.scrolled_panel.SetupScrolling()
#        self.scrolled_panel.SetSizer(self.hbox2)
        
        self.hbox3 = wx.BoxSizer(wx.HORIZONTAL)
        
        catLabel = wx.StaticText(self.panel, -1, "Category: ")
        self.catText = wx.TextCtrl(self.panel, -1, "", size=(100,-1))

        keyLabel = wx.StaticText(self.panel, -1, "Payload Key: ")
        self.keyText = wx.TextCtrl(self.panel, -1, "", size=(100,-1))
        
        payloadLabel = wx.StaticText(self.panel, -1, "Payload Value: ")
        self.payloadText = wx.TextCtrl(self.panel, -1, "", size=(200,-1))
        
        self.send_button = wx.Button(self.panel, -1, "Send")
        self.Bind(wx.EVT_BUTTON, self.on_send_button, self.send_button)
        
        self.hbox3.Add(catLabel, 0, wx.ALL, 5)
        self.hbox3.Add(self.catText, 0, wx.ALL, 5)
        self.hbox3.Add(keyLabel, 0, wx.ALL, 5)
        self.hbox3.Add(self.keyText, 0, wx.ALL, 5)
        self.hbox3.Add(payloadLabel, 0, wx.ALL, 5)
        self.hbox3.Add(self.payloadText, 0, wx.ALL, 5)
        self.hbox3.Add(self.send_button, 0, wx.ALL, 5)
        

        self.vbox = wx.BoxSizer(wx.VERTICAL)
        self.vbox.Add(self.canvas, 1, flag=wx.LEFT | wx.TOP | wx.GROW)    
        self.vbox.Add(self.toolbar, 0, flag=wx.ALIGN_LEFT | wx.TOP | wx.GROW)
        self.vbox.Add(self.hbox1, 0, flag=wx.ALIGN_LEFT | wx.TOP)
        self.vbox.Add(self.hbox2, 0, flag=wx.ALIGN_LEFT | wx.TOP)
#        self.vbox.Add(self.scrolled_panel, 0, flag=wx.ALIGN_LEFT | wx.TOP)

        self.vbox.Add(wx.StaticLine(self.panel), 0, wx.ALL|wx.EXPAND, 5)
        self.vbox.Add(self.hbox3, 0, flag=wx.ALIGN_LEFT | wx.TOP)
        
        
        self.panel.SetSizer(self.vbox)
        self.vbox.Fit(self)
        
    def create_status_bar(self):
        self.statusbar = self.CreateStatusBar()

    def init_plot(self):
        self.dpi = 100
        self.fig = Figure((3.0, 3.0), dpi=self.dpi)

        self.axes = self.fig.add_subplot(111)
        
        pylab.setp(self.axes.get_xticklabels(), fontsize=8)
        pylab.setp(self.axes.get_yticklabels(), fontsize=8)
        
        # plot the data as a line series, and save the reference 
        # to the plotted line series
        #
        #self.plot_data = self.axes.plot([], linewidth=1,color=(0, 0, 0),)[0]

    def draw_plot(self):
        """ Redraws the plot
        """
        maxSize = 0
        ymin = 0
        ymax = 0
        xmin = 0
        for channel in self.channels:
            if channel.isActive:
                maxSize = max(maxSize, channel.lastData)
                ymin = round(min(channel.minVal,ymin),0)
                ymax = round(max(channel.maxVal,ymax),1)
                xmin = min(xmin, channel.xMin)
      
        xmax = maxSize if maxSize > 5 else 5
        if self.cb_x_window.IsChecked():
            xmin = xmin if maxSize - 5 < 0 else maxSize - 5

        if self.cb_y_window.IsChecked():
            ymin = -0.1
            ymax = 1.1
        else:
            ymax *= 2
        #if self.toolbar._active == None:
        self.axes.set_xbound(lower=xmin, upper=xmax)
        self.axes.set_ybound(lower=ymin, upper=ymax)
        
        # anecdote: axes.grid assumes b=True if any other flag is
        # given even if b is set to False.
        # so just passing the flag into the first statement won't
        # work.
        #
        if self.cb_grid.IsChecked():
            self.axes.grid(True, color='gray')
        else:
            self.axes.grid(False)

        # Using setp here is convenient, because get_xticklabels
        # returns a list over which one needs to explicitly 
        # iterate, and setp already handles this.
        #  
        pylab.setp(self.axes.get_xticklabels(), 
            visible=self.cb_xlab.IsChecked())

        for channel in self.channels:
            channel.updatePlotData()

        self.canvas.draw()
      
    def on_clearAll_button(self, event):
        for channel in self.channels:
            channel.on_clear_button(event)
        self.firstTime = None
        

    def on_send_button(self, event):
      cat = self.catText.GetValue()
      key = self.keyText.GetValue()
      payload = self.payloadText.GetValue()
      print "Sending %s to category %s" % ({key:payload}, cat)
      self.ih.publish(cat, {key:payload})

    
    def on_pause_button(self, event):
        self.paused = not self.paused
        
    def on_addDistChannel_button(self, event):
        newDistChannelBox = DistributionChannelBox(self.panel, -1, self)
        self.hbox2.Add(newDistChannelBox, 0, wx.ALL, 5)
        self.channels.append(newDistChannelBox)
        self.vbox.Layout()
        self.vbox.Fit(self)
        self.Layout()
    
    def on_addChannel_button(self, event):
        newChannelBox = ChannelBox(self.panel, -1, self)
        self.hbox2.Add(newChannelBox, 0, wx.ALL, 5)
        #self.hbox2.Add(self.xmin_control, border=5, flag=wx.ALL)
        self.channels.append(newChannelBox)
        self.vbox.Layout()
        #self.hbox2.Fit(self)
        self.vbox.Fit(self)
        self.Layout()
        
    def removeChannel(self, channel):
        self.ih.removeInputCategory(channel.category)
        self.channels.remove(channel)
        self.hbox2.Remove(channel)
        pylab.setp(self.axes, title="")
        channel.Destroy()
        self.vbox.Layout()
        self.vbox.Fit(self)
        self.Layout()
      
    def on_update_pause_button(self, event):
        label = "Resume" if self.paused else "Pause"
        self.pause_button.SetLabel(label)
    
    def on_cb_grid(self, event):
        self.draw_plot()
    
    def on_cb_xlab(self, event):
        self.draw_plot()
        
    def on_cb_window(self, event):
      self.draw_plot()
    
    def on_save_plot(self, event):
        file_choices = "PNG (*.png)|*.png"
        
        dlg = wx.FileDialog(
            self, 
            message="Save plot as...",
            defaultDir=os.getcwd(),
            defaultFile="plot.png",
            wildcard=file_choices,
            style=wx.SAVE)
        
        if dlg.ShowModal() == wx.ID_OK:
            path = dlg.GetPath()
            self.canvas.print_figure(path, dpi=self.dpi)
            self.flash_status_message("Saved to %s" % path)
    
    def on_redraw_timer(self, event):
        if not self.paused:      
            self.draw_plot()
        if self.prepFlashMessage != None:
            self.flash_status_message(self.prepFlashMessage)
            self.prepFlashMessage = None
        if self.disableChannelBuffer != None:
            self.disableChannelBuffer.isActive = False
            self.disableChannelBuffer.keyText.SetFocus()
            self.disableChannelBuffer = None
    
    def on_exit(self, event):
        self.Destroy()
    
    def flash_status_message(self, msg, flash_len_ms=1500):
        self.statusbar.SetStatusText(msg)
        self.timeroff = wx.Timer(self)
        self.Bind(
            wx.EVT_TIMER, 
            self.on_flash_status_off, 
            self.timeroff)
        self.timeroff.Start(flash_len_ms, oneShot=True)
    
    def on_flash_status_off(self, event):
        self.statusbar.SetStatusText('')


if __name__ == '__main__':
  
    component = "PredictionPlot"
    ih = ipaacaHandler.IpaacaHandler(component, [], None)  
     
    app = wx.PySimpleApp()
    app.frame = GraphFrame(ih)

    app.frame.Show()
    app.MainLoop()

