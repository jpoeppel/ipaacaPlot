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
11.08.2016
Added distribution plots as alternative (still early testing) and refactored channelBoxes
accordingly.
Also refactored back to 4 spaces=1 tab, to be more consitent with the python standard.
12.08.2016
Finished saving and loading of channel configurations.
15.08.2016
- Huge performance improvement by removing EVT_UPDATE_UI 
- Allow to specify a positional argument to immediately load a given config file.
"""
import os
import wx
import sys
import ipaaca
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
import json #For config  files

class ChannelBox(wx.Panel):
    """
        Abstract class for a channel box, which provides the commong functionality for both timelines
        and distribution plots.
    """
    
    def __init__(self, parent, ID, ctrl, config=None):
        wx.Panel.__init__(self, parent, ID)
        self.ctrl = ctrl
        self.xData = []
        self.yData = []
        self.lastData = 0
        self.colour = (0,0,0)
        self._isActive = False
        self.minVal = 0.0
        self.maxVal = 0.0
        self.style= "-"
        self.dataLock = threading.Lock()
        self.category = ""
        self.isDetached = False
        
        self._create_elements(config)
        
    def _create_elements(self):
        raise NotImplementedError
        
    @property
    def isActive(self):
        return (self._isActive and len(self.yData) > 0)
        
        
    @isActive.setter
    def isActive(self, value):
        self._isActive = value
        self.activeCB.SetValue(value)
      
      
    def on_StyleSelect(self, event):
        self.style = event.GetString()
        self._update_style()
        
    def _update_style(self):
        if self.style in ['*','.','d']:
            pylab.setp(self.plot_data, linestyle= '')
            pylab.setp(self.plot_data, marker= self.style)
        else:
            pylab.setp(self.plot_data, linestyle= self.style)
            pylab.setp(self.plot_data, marker= '')
      
    def on_catText_enter(self, event):
        self.category = self.catText.GetValue()
        
    def on_colourChange(self, event):
        col=self.colourPicker.GetColour()
        self.colour = (float(col[0])/255,float(col[1])/255,float(col[2])/255)
        pylab.setp(self.plot_data, color=self.colour)
   
    def on_clear_button(self, event):
        self.xData = []
        self.yData= []
        self.lastData = 0
        self.maxVal = 0.0
        self.minVal = 0.0
      
    def on_remove_button(self,event):
        self.remove_button.Unbind(wx.EVT_BUTTON)
        if self.plot_data in self.ctrl.axes.lines:
            self.ctrl.axes.lines.remove(self.plot_data)
        self.ctrl.removeChannel(self)
        
    def updatePlotData(self):
        raise NotImplementedError   
        
    def on_checkActive(self, event):       
        sender = event.GetEventObject()
        isChecked = sender.GetValue()
        self._change_activity(isChecked)
            
    def _change_activity(self, activity):
        self.isActive = activity
        if self._isActive:
            self.ctrl.activate_channel(self)
            if self.plot_data not in self.ctrl.axes.lines:
                self.ctrl.axes.lines.append(self.plot_data)
        else:
            if self.plot_data in self.ctrl.axes.lines:
                self.ctrl.axes.lines.remove(self.plot_data)
            
    def update_data(self, firstTimestep, payload):
        raise NotImplementedError
    
class DistributionChannelBox(ChannelBox):
    """
        A channel box for plotting "distributions". Expects to find x and y values in the payload
        designated by their respective keys. The x values are used as labels for the bins in
        the y values. x and y values MUST have identical dimensions!
    """
    
    defaults = {"category": "", 
                "xKey": "x", 
                "yKey":"y", 
                "color": [0,0,0], 
                "style": "*", 
                "active": False}
    
    def __init__(self, parent, ID, ctrl, config=None):
        self.xKey = "x"
        self.yKey = "y"
        self.title = ""
        self.xMin = -1
        
        super(DistributionChannelBox, self).__init__(parent, ID, ctrl, config)
        self.plot_data = ctrl.axes.plot([], linewidth=1,color=self.colour,marker="*", linestyle="")[0]
        
    def _create_elements(self, config):
        
        if config == None:
            #Create empty config, since it will be filled with defaults afterwards anyways
            config = {}
        # Fill potentially missing defaults:
        for k,v in self.defaults.items():
            if not k in config:
                config[k] = v
        self.activeCB = wx.CheckBox(self, -1, "Active")
        self.activeCB.SetValue(config["active"])
        self.activeCB.Bind(wx.EVT_CHECKBOX, self.on_checkActive)
        
        box = wx.StaticBox(self, -1, "Add Distribution Channel")
        sizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        
        catLabel = wx.StaticText(self, -1, "Category: ")
        self.category = config["category"]
        self.catText = wx.TextCtrl(self, -1, self.category, size=(100,-1))

        self.catText.Bind(wx.EVT_TEXT_ENTER, self.on_catText_enter)   
        self.catText.Bind(wx.EVT_KILL_FOCUS, self.on_catText_enter)
        
        category_box = wx.BoxSizer(wx.HORIZONTAL)
        category_box.Add(catLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        category_box.Add(self.catText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(self, -1, "X Key: ")
        self.xKey = config["xKey"]
        self.xKeyText = wx.TextCtrl(self, -1, self.xKey, size=(100,-1))
        
        self.xKeyText.Bind(wx.EVT_TEXT_ENTER, self.on_xKeyText_enter)         
        self.xKeyText.Bind(wx.EVT_KILL_FOCUS, self.on_xKeyText_enter)
        
        x_key_box = wx.BoxSizer(wx.HORIZONTAL)
        x_key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        x_key_box.Add(self.xKeyText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(self, -1, "Y Key: ")
        self.yKey = config["yKey"]
        self.yKeyText = wx.TextCtrl(self, -1, self.yKey, size=(100,-1))
        
        self.yKeyText.Bind(wx.EVT_TEXT_ENTER, self.on_yKeyText_enter)         
        self.yKeyText.Bind(wx.EVT_KILL_FOCUS, self.on_yKeyText_enter)
        
        y_key_box = wx.BoxSizer(wx.HORIZONTAL)
        y_key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        y_key_box.Add(self.yKeyText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        self.keyText = self.yKeyText #Make it so the ctrl can focus this one

        self.colourPicker = wx.ColourPickerCtrl(self, -1)
        self.colour = (float(config["color"][0])/255, float(config["color"][1])/255,float(config["color"][2])/255)
        self.colourPicker.SetColour(config["color"])
        self.colourPicker.Bind(wx.EVT_COLOURPICKER_CHANGED, self.on_colourChange)
        
        self.remove_button = wx.Button(self, -1, "Remove")
        self.Bind(wx.EVT_BUTTON, self.on_remove_button, self.remove_button)
        
        figureLabel = wx.StaticText(self, -1, "Show in figure: ")
        self.figureCB = wx.ComboBox(self, value=self.style, size=(80, 30), choices=self.ctrl.get_figures(), 
            style=wx.CB_READONLY)
        self.figureCB.SetValue("Main")
        self.figureCB.Bind(wx.EVT_COMBOBOX, self.on_figure_select)
        
        figureBox = wx.BoxSizer(wx.HORIZONTAL)
        figureBox.Add(figureLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        figureBox.Add(self.figureCB, flag=wx.ALIGN_CENTER_VERTICAL)
        
#        self.detach_button = wx.Button(self, -1, "Detach")
#        self.Bind(wx.EVT_BUTTON, self.on_detach_button, self.detach_button)
        
        styles = ['-','*','.','--', ':', 'd']
        self.style = config["style"]
        self.lineStyleCB = wx.ComboBox(self, value=self.style, size=(60, 30), choices=styles, 
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
#        hbox2.Add(self.detach_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox2.Add(self.remove_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)   
        sizer.Add(figureBox, 0, wx.ALL, 10)
        sizer.Add(hbox2, 0, wx.ALL, 10)
        sizer.Add(self.activeCB, 0, wx.ALL, 10)
        
        self.SetSizer(sizer)
        sizer.Fit(self)
        self.catText.SetFocus()
   
    def on_xKeyText_enter(self, event):
        self.xKey = self.xKeyText.GetValue()
        
    def on_yKeyText_enter(self, event):
        self.yKey = self.yKeyText.GetValue()
        
#    def on_detach_button(self, event):
#        self.plot_data = self.ctrl.create_child_figure(self)
#        self.isDetached = True
        
    def on_figure_select(self, event):
        figure = event.GetString()
        self.ctrl.change_figure(self, figure)
        
    def updatePlotData(self):
        if self._isActive:
            with self.dataLock:
              self.plot_data.set_xdata(np.arange(len(self.xData)))  
              self.plot_data.set_ydata(np.array(self.yData))      
              
              #TODO: Wrong when detached
              self.ctrl.axes.set_xticks(np.arange(len(self.xData)))
              self.ctrl.axes.set_xticklabels(self.xData)

            
            pylab.setp(self.ctrl.axes, title=self.title)
            
    def update_data(self, firstTimestamp, payload):
        
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
        
        
class TimeLineChannelBox(ChannelBox):
    """
        A channel box for time series. Expects to find a single new data point in the payload
        designated by the specified key which is added to the timeline that is being drawn.
    """
    
    defaults= {"category": "", 
               "key": "", 
               "color": [0,0,0], 
               "style": "-", 
               "active": False, 
               "useTime": True}
    
    def __init__(self, parent, ID, ctrl, config=None):
        self.key = ""
        self.xMin = 0
        self.useTime = True
        super(TimeLineChannelBox, self).__init__(parent, ID, ctrl, config)
        self.plot_data = ctrl.axes.plot([], linewidth=1,color=self.colour,)[0]
        
    def _create_elements(self, config):

        if config == None:
            #Create empty config, since it will be filled with defaults afterwards anyways
            config = {}
        # Fill potentially missing defaults:
        for k,v in self.defaults.items():
            if not k in config:
                config[k] = v
        
        self.activeCB = wx.CheckBox(self, -1, "Active")
        self.activeCB.SetValue(config["active"])
        self.activeCB.Bind(wx.EVT_CHECKBOX, self.on_checkActive)    
        
        self.useTimeCB = wx.CheckBox(self, -1, "Use Time")
        self.useTime = config["useTime"]
        self.useTimeCB.SetValue(self.useTime)
        self.useTimeCB.Bind(wx.EVT_CHECKBOX, self.on_checkUseTime)
        
        box = wx.StaticBox(self, -1, "Add Channel")
        sizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        
        catLabel = wx.StaticText(self, -1, "Category: ")
        self.category = config["category"]
        self.catText = wx.TextCtrl(self, -1, self.category, size=(100,-1))

        self.catText.Bind(wx.EVT_TEXT_ENTER, self.on_catText_enter)   
        self.catText.Bind(wx.EVT_KILL_FOCUS, self.on_catText_enter)
        
        category_box = wx.BoxSizer(wx.HORIZONTAL)
        category_box.Add(catLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        category_box.Add(self.catText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(self, -1, "Payload Key: ")
        self.key = config["key"]
        self.keyText = wx.TextCtrl(self, -1, self.key, size=(100,-1))
        
        self.keyText.Bind(wx.EVT_TEXT_ENTER, self.on_keyText_enter)         
        self.keyText.Bind(wx.EVT_KILL_FOCUS, self.on_keyText_enter)

        
        key_box = wx.BoxSizer(wx.HORIZONTAL)
        key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        key_box.Add(self.keyText, flag=wx.ALIGN_CENTER_VERTICAL)

        self.colourPicker = wx.ColourPickerCtrl(self, -1)
        self.colour = (float(config["color"][0])/255, float(config["color"][1])/255,float(config["color"][2])/255)
        self.colourPicker.SetColour(config["color"])
        self.colourPicker.Bind(wx.EVT_COLOURPICKER_CHANGED, self.on_colourChange)
        
        self.clear_button = wx.Button(self, -1, "Clear")
        self.Bind(wx.EVT_BUTTON, self.on_clear_button, self.clear_button)
        
        self.remove_button = wx.Button(self, -1, "Remove")
        self.Bind(wx.EVT_BUTTON, self.on_remove_button, self.remove_button)
        
        styles = ['-','*','.','--', ':', 'd']
        self.style = config["style"]
        self.lineStyleCB = wx.ComboBox(self, value=self.style, size=(60, 30), choices=styles, 
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
        
        hbox3 = wx.BoxSizer(wx.HORIZONTAL)
        hbox3.Add(self.activeCB,border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox3.Add(self.useTimeCB,border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        sizer.Add(hbox3, 0, wx.ALL, 10)
        
        self.SetSizer(sizer)
        sizer.Fit(self)
        self.catText.SetFocus()
        
        
    def updatePlotData(self):
        if self._isActive:
            with self.dataLock:
                if self.useTime:
                    self.plot_data.set_xdata(np.array(self.xData)) 
                else:
                    self.plot_data.set_xdata(np.arange(len(self.yData))) 
                self.plot_data.set_ydata(np.array(self.yData))   
        
    def on_keyText_enter(self, event):
        self.key = self.keyText.GetValue()
        
    def on_checkUseTime(self, event):
        self.useTime = self.useTimeCB.GetValue()
        
    def _addData(self, timestamp, data):
        if self.useTime:
            self.lastData = timestamp
        else:
            self.lastData= len(self.yData)+1
        self.maxVal = max(self.maxVal, data)
        self.minVal = min(self.minVal, data)
        with self.dataLock:
            self.xData.append(timestamp)
            self.yData.append(data)
        
    def update_data(self, firstTimestamp, payload):
        timestamp = time.time()-firstTimestamp
        try:
            data = float(payload[self.key])
            self._addData(timestamp, data)
        except KeyError:
#            self.ctrl.prepFlashMessage = "Invalid key ({}) for category: {}. Channel will be disabled".format(self.key, self.category)
#            self.ctrl.disableChannelBuffer = self
            pass
      
      
class ChildFrame(wx.Frame):
    
    def __init__(self, parent, name, channel):
        super(ChildFrame, self).__init__(parent, -1, size=(400,200), title="Detached Figure")
        self.parent = parent
        self.dpi = 100
        self.fig = Figure((3.0, 3.0), dpi=self.dpi)
        self.axes = self.fig.add_subplot(111)
        pylab.setp(self.axes.get_xticklabels(), fontsize=8)
        pylab.setp(self.axes.get_yticklabels(), fontsize=8)
        self.channels = [channel]

        self.panel = wx.Panel(self)
        self.canvas = FigCanvas(self.panel, -1, self.fig)
        self.toolbar = NavigationToolbar(self.canvas)
        self.toolbar.Realize()
        self.toolbar.DeleteToolByPos(7) #Deletes the adjust subplots button
        self.toolbar.DeleteToolByPos(2) #Deletes the forward button
        self.toolbar.DeleteToolByPos(1) #Deletes the backward button
        self.toolbar.DeleteToolByPos(0) #Deletes the home button
        
        self.vbox = wx.BoxSizer(wx.VERTICAL)
        self.vbox.Add(self.canvas, 1, flag=wx.LEFT | wx.TOP | wx.GROW)    
        self.vbox.Add(self.toolbar, 0, flag=wx.ALIGN_LEFT | wx.TOP | wx.GROW)
        
        
        self.panel.SetSizer(self.vbox)
        self.vbox.Fit(self)
        
    def draw_plot(self):
        """ Redraws the plot
        """
        print "drawing!"
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

        ymax *= 2

        self.axes.set_xbound(lower=xmin, upper=xmax)
        self.axes.set_ybound(lower=ymin, upper=ymax)
        
        # anecdote: axes.grid assumes b=True if any other flag is
        # given even if b is set to False.
        # so just passing the flag into the first statement won't
        # work.
        #

        # Using setp here is convenient, because get_xticklabels
        # returns a list over which one needs to explicitly 
        # iterate, and setp already handles this.
        #  

        for channel in self.channels:
            channel.updatePlotData()

        self.canvas.draw()
        

class GraphFrame(wx.Frame):
    """ The main frame of the application
    """
    title = 'Ipaaca Plot Visualisation.'
    
    def __init__(self, configPath=None):
        wx.Frame.__init__(self, None, -1, self.title)
        self.outputBuffer = ipaaca.OutputBuffer("Ipaaca_Plot")
        self.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
        self.inputBuffer.register_handler(self.update_data)
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
        self.newData = False
        if configPath:
            self._handle_config(configPath)
        
        self.detachedChilds = []
        self.detached_child = None
        
    def _when_closed(self, event):
        self.redraw_timer.Destroy()
        sys.exit(0)
        
        
    def get_figures(self):
        res = ["Main"]
        for dc in self.detachedChilds:
            res.append(dc.name)
        res.append("New")
        return res

    def activate_channel(self, channel):
        if not channel.category in self.inputBuffer._category_interests:
            self.inputBuffer.add_category_interests(channel.category)
        
        
    def update_data(self, iu, event_type, local):
        self.newData = True
        if self.firstTime == None:
            self.firstTime = time.time()
        if event_type in ['ADDED', 'UPDATED', 'MESSAGE']:
            category = iu.category
            for channel in self.channels:
                if channel._isActive and channel.category == category:
                    channel.update_data(self.firstTime, iu.payload)

    def create_menu(self):
        self.menubar = wx.MenuBar()
        
        menu_file = wx.Menu()
        m_expt = menu_file.Append(-1, "Export plot\tCtrl-E", "Save plot to file")
        self.Bind(wx.EVT_MENU, self.on_save_plot, m_expt)
        
        m_saveConfig = menu_file.Append(-1, "Save configuration\tCtrl-S", "Save plot configuration")        
        self.Bind(wx.EVT_MENU, self.on_save_config, m_saveConfig)

        m_loadConfig = menu_file.Append(-1, "Load configuration\tCtrl-O", "Load plot configuration")        
        self.Bind(wx.EVT_MENU, self.on_load_config, m_loadConfig)
        
        menu_file.AppendSeparator()
        m_exit = menu_file.Append(-1, "Exit\tCtrl-Q", "Exit")
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
#        
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
        self.Bind(wx.EVT_BUTTON, self.on_addTimelineChannel_button, self.addChannel_button)
        
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
#        
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
        

    def change_figure(self, channel, figure):
        if figure == "Main":
            channel.isDetached = False
            channel.plot_data = self.axes.plot([], linewidth=1,color=channel.colour,marker="*", linestyle="")[0]
        else:
            channel.isDetached = True
            
        if figure == "New":
            newFrame = ChildFrame(self, "Figure"+str(len(self.detachedChilds)), channel)
            newFrame.Show()
            self.detachedChilds.append(newFrame)
        else:
            for dc in self.detachedChilds:
                if dc.name == figure:
                    newFrame = dc
                    break
        channel.plot_data = newFrame.axes.plot([], linewidth=1,color=channel.colour,marker="*", linestyle="")[0]
        
    def create_child_figure(self, channel):
        self.detached_child = ChildFrame(self, channel)
        self.detached_child.Show()
        return self.detached_child.axes.plot([], linewidth=1,color=channel.colour,marker="*", linestyle="")[0]
        
    def create_status_bar(self):
        self.statusbar = self.CreateStatusBar()

    def init_plot(self):
        self.dpi = 100
        self.fig = Figure((3.0, 3.0), dpi=self.dpi)

        self.axes = self.fig.add_subplot(111)
        
        pylab.setp(self.axes.get_xticklabels(), fontsize=8)
        pylab.setp(self.axes.get_yticklabels(), fontsize=8)
        

    def draw_plot(self):
        """ Redraws the plot
        """
        maxSize = 0
        ymin = 0
        ymax = 0
        xmin = 0
        for channel in self.channels:
            if channel.isActive and not channel.isDetached:
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
        for dc in self.detachedChilds:
            dc.draw_plot()
        self.newData = False
      
    def on_clearAll_button(self, event):
        for channel in self.channels:
            channel.on_clear_button(event)
        self.firstTime = None
        self.newData = True
        

    def on_send_button(self, event):
      cat = self.catText.GetValue()
      key = self.keyText.GetValue()
      payload = self.payloadText.GetValue()
      print "Sending %s to category %s" % ({key:payload}, cat)
      msg = ipaaca.Message(cat)
      msg.payload = {key:payload}
      self.outputBuffer.add(msg)

    
    def on_pause_button(self, event):
        self.paused = not self.paused
        label = "Resume" if self.paused else "Pause"
        self.pause_button.SetLabel(label)
        
    def on_addDistChannel_button(self, event):
        newDistChannelBox = DistributionChannelBox(self.panel, -1, self)
        self._add_channelBox(newDistChannelBox)
    
    def on_addTimelineChannel_button(self, event):
        newChannelBox = TimeLineChannelBox(self.panel, -1, self)
        self._add_channelBox(newChannelBox)
        
    def _add_channelBox(self, channelBox):
        self.hbox2.Add(channelBox, 0, wx.ALL, 5)
        self.channels.append(channelBox)
        self.vbox.Layout()
        self.vbox.Fit(self)
        self.Layout()
        
    def removeChannel(self, channel):
        for c in self.channels:
            if c != channel and c.category == channel.category:
                break
        else:
            self.inputBuffer.remove_category_interests(channel.category)
        self.channels.remove(channel)
        self.hbox2.Remove(channel)
        pylab.setp(self.axes, title="")
        channel.Destroy()
        if len(self.channels) == 0:
            self.firstTime = None
        self.vbox.Layout()
        self.vbox.Fit(self)
        self.Layout()
        
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
        if not self.paused and self.newData:      
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
        
    def on_load_config(self, event):
        openFileDialog = wx.FileDialog(self, 
                                       message="Open plot config", 
                                       defaultDir=os.getcwd(), 
                                       defaultFile="", 
                                       wildcard="Plot config files (*.pconf)|*.pconf", 
                                       style=wx.FD_OPEN | wx.FILE_MUST_EXIST)
        if openFileDialog.ShowModal() == wx.ID_OK:
            path = openFileDialog.GetPath()
            
            self._handle_config(path)
            
    def _handle_config(self, configPath):
        config = json.load(open(configPath))
        for channel in config["channels"]:
            if channel["channeltype"] == "Timeline":
                newChannelBox = TimeLineChannelBox(self.panel, -1, self, channel["config"])
                
            elif channel["channeltype"] == "Distribution":
                newChannelBox = DistributionChannelBox(self.panel, -1, self, channel["config"])
                
            self._add_channelBox(newChannelBox)
            newChannelBox._update_style() #Needs to be done after it was created.
            newChannelBox._change_activity(channel["config"]["active"]) #To potentially start the recording
                
    def on_save_config(self, event):
        saveFileDialog = wx.FileDialog(
            self, 
            message="Save plot config",
            defaultDir=os.getcwd(),
            defaultFile="config.pconf",
            wildcard="Plot config files (*.pconf)|*.pconf", 
            style=wx.SAVE)
        if saveFileDialog.ShowModal() == wx.ID_OK:
            path = saveFileDialog.GetPath()
            config = {"channels":[]}
            for channel in self.channels:
                if isinstance(channel, TimeLineChannelBox):
                    channelObject = {"channeltype": "Timeline", "config" : {"category": channel.category,
                                                                            "key": channel.key,
                                                                            "color": [int(channel.colour[0]*255),int(channel.colour[1]*255),int(channel.colour[2]*255)],
                                                                            "style":channel.style,
                                                                            "active":channel.isActive,
                                                                            "useTime": channel.useTime}}
                elif isinstance(channel, DistributionChannelBox):
                    channelObject = {"channeltype": "Distribution", "config": {"category": channel.category,
                                                                               "xKey": channel.xKey,
                                                                               "yKey": channel.yKey,
                                                                               "color":[int(channel.colour[0]*255),int(channel.colour[1]*255),int(channel.colour[2]*255)],
                                                                               "style": channel.style,
                                                                               "active": channel.isActive}}
                config["channels"].append(channelObject)
            json.dump(config, open(path,"w"))
                    
    
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
  
#    component = "PredictionPlot"
     
    configPath = None
    if len(sys.argv) > 1:
        configPath = sys.argv[1]
    
    app = wx.PySimpleApp()
    app.frame = GraphFrame(configPath = configPath)

    app.frame.Show()
    app.MainLoop()

