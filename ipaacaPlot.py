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
16.08.2016
Channels can now be shown in detached figures(windows)
Additional windows and their position are also stored in the config file
Now another optional argument can be given to specify the update rate.
"""
import os
import wx
from wx.lib.agw.pycollapsiblepane import PyCollapsiblePane
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
import pylab
import json #For config  files

class ChannelBox(PyCollapsiblePane):
#class ChannelBox(wx.CollapsiblePane):
    """
        Abstract class for a channel box, which provides the commong functionality for both timelines
        and distribution plots.
    """
    
    def __init__(self, parent, ID, ctrl, name="Channel", figurePanel=None, config=None):
#        wx.Panel.__init__(self, parent, ID)
        super(ChannelBox, self).__init__(parent, ID, name, agwStyle=wx.CP_GTK_EXPANDER)
        self.name = name
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
        if figurePanel == None:
            figurePanel = ctrl.figurePanel
        self.figurePanel = figurePanel
        
        self._create_elements(config)
        try:
            if not config["collapsed"]:
                self.Expand()
        except KeyError:
            #If collapsed not defined, also expand
            self.Expand()
        self.Bind(wx.EVT_COLLAPSIBLEPANE_CHANGED, self.on_change)
        
        
    def OnButton(self, event):
        """
            Intercept on Button pressin order to set the labels correctly!
        """

        if self.IsCollapsed():
            self.SetLabel(self.name)
        else:
            self.SetLabel(self.name + "({})".format(self.category))
            
        #Call original method
        super(ChannelBox,self).OnButton(event)
    
        
    def on_change(self, event):
        "Notify control to resize accordingly"
        self.ctrl.update_layout()
        
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
        self.figurePanel.canvas.draw()
      
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
        self.plot_data.set_xdata([])  
        self.plot_data.set_ydata([])
        self.figurePanel.canvas.draw()
      
    def on_remove_button(self,event):
        self.remove_button.Unbind(wx.EVT_BUTTON)
        self.figurePanel.remove_channel(self)
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
            if self.plot_data not in self.figurePanel.axes.lines:
                self.figurePanel.axes.lines.append(self.plot_data)
        else:
            if self.plot_data in self.figurePanel.axes.lines:
                self.figurePanel.axes.lines.remove(self.plot_data)
            
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
    
    def __init__(self, parent, ID, ctrl, figurePanel=None, config=None):
        self.xKey = "x"
        self.yKey = "y"
        self.title = ""
        self.xMin = -1
        
        super(DistributionChannelBox, self).__init__(parent, ID, ctrl, name="Distribution", figurePanel=figurePanel, config=config)
        self.plot_data = self.figurePanel.axes.plot([], linewidth=1,color=self.colour,marker="*", linestyle="")[0]
        
    def _create_elements(self, config):
        
        if config == None:
            #Create empty config, since it will be filled with defaults afterwards anyways
            config = {}
        # Fill potentially missing defaults:
        for k,v in self.defaults.items():
            if not k in config:
                config[k] = v
        parent = self.GetPane()
        self.activeCB = wx.CheckBox(parent, -1, "Active")
        self.activeCB.SetValue(config["active"])
        self.activeCB.Bind(wx.EVT_CHECKBOX, self.on_checkActive)
        
        box = wx.StaticBox(parent, -1, "")
        sizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        
        catLabel = wx.StaticText(parent, -1, "Category: ")
        self.category = config["category"]
        self.catText = wx.TextCtrl(parent, -1, self.category, size=(100,-1))

        self.catText.Bind(wx.EVT_TEXT_ENTER, self.on_catText_enter)   
        self.catText.Bind(wx.EVT_KILL_FOCUS, self.on_catText_enter)
        
        category_box = wx.BoxSizer(wx.HORIZONTAL)
        category_box.Add(catLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        category_box.Add(self.catText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(parent, -1, "X Key: ")
        self.xKey = config["xKey"]
        self.xKeyText = wx.TextCtrl(parent, -1, self.xKey, size=(100,-1))
        
        self.xKeyText.Bind(wx.EVT_TEXT_ENTER, self.on_xKeyText_enter)         
        self.xKeyText.Bind(wx.EVT_KILL_FOCUS, self.on_xKeyText_enter)
        
        x_key_box = wx.BoxSizer(wx.HORIZONTAL)
        x_key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        x_key_box.Add(self.xKeyText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(parent, -1, "Y Key: ")
        self.yKey = config["yKey"]
        self.yKeyText = wx.TextCtrl(parent, -1, self.yKey, size=(100,-1))
        
        self.yKeyText.Bind(wx.EVT_TEXT_ENTER, self.on_yKeyText_enter)         
        self.yKeyText.Bind(wx.EVT_KILL_FOCUS, self.on_yKeyText_enter)
        
        y_key_box = wx.BoxSizer(wx.HORIZONTAL)
        y_key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        y_key_box.Add(self.yKeyText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        self.keyText = self.yKeyText #Make it so the ctrl can focus this one

        self.colourPicker = wx.ColourPickerCtrl(parent, -1)
        self.colour = (float(config["color"][0])/255, float(config["color"][1])/255,float(config["color"][2])/255)
        self.colourPicker.SetColour(config["color"])
        self.colourPicker.Bind(wx.EVT_COLOURPICKER_CHANGED, self.on_colourChange)
        
        self.remove_button = wx.Button(parent, -1, "Remove")
        self.Bind(wx.EVT_BUTTON, self.on_remove_button, self.remove_button)
        
        figureLabel = wx.StaticText(parent, -1, "Show in figure: ")
        self.figureCB = wx.ComboBox(parent, value=self.style, size=(80, 30), choices=self.ctrl.get_figures(), 
            style=wx.CB_READONLY)
        self.figureCB.SetValue("Main")
        self.figureCB.Bind(wx.EVT_COMBOBOX, self.on_figure_select)
        
        figureBox = wx.BoxSizer(wx.HORIZONTAL)
        figureBox.Add(figureLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        figureBox.Add(self.figureCB, flag=wx.ALIGN_CENTER_VERTICAL)
        
        styles = ['-','*','.','--', ':', 'd']
        self.style = config["style"]
        self.lineStyleCB = wx.ComboBox(parent, value=self.style, size=(60, 30), choices=styles, 
            style=wx.CB_READONLY)
        self.lineStyleCB.Bind(wx.EVT_COMBOBOX, self.on_StyleSelect)
        
        sizer.Add(category_box, 0, wx.ALL, 10)
        sizer.Add(x_key_box, 0, wx.ALL, 10)
        sizer.Add(y_key_box, 0, wx.ALL, 10)
        hbox = wx.BoxSizer(wx.HORIZONTAL)
        hbox.Add(self.colourPicker, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox.Add(self.lineStyleCB, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        
        
        sizer.Add(hbox, 0, wx.ALL, 10)
        sizer.Add(figureBox, 0, wx.ALL, 10)
        hbox2 = wx.BoxSizer(wx.HORIZONTAL)
        hbox2.Add(self.remove_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)   
        
        sizer.Add(hbox2, 0, wx.ALL, 10)
        sizer.Add(self.activeCB, 0, wx.ALL, 10)
        
        parent.SetSizer(sizer)
        sizer.Fit(parent)
        self.catText.SetFocus()
   
    def on_xKeyText_enter(self, event):
        self.xKey = self.xKeyText.GetValue()
        
    def on_yKeyText_enter(self, event):
        self.yKey = self.yKeyText.GetValue()
        
    def on_figure_select(self, event):
        figure = event.GetString()
        self.ctrl.change_figure(self, figure)
        
    def updatePlotData(self):
        if self._isActive:
            with self.dataLock:
              self.plot_data.set_xdata(range(len(self.xData)))  
              self.plot_data.set_ydata(self.yData)
              
              self.figurePanel.axes.set_xticks(range(len(self.xData)))
              self.figurePanel.axes.set_xticklabels(self.xData)
              
              self.figurePanel.axes.draw_artist(self.figurePanel.axes.patch)
              self.figurePanel.axes.draw_artist(self.plot_data)
#              self.figurePanel.fig.canvas.update()
#              self.figurePanel.fig.flush_events()
            
            pylab.setp(self.figurePanel.axes, title=self.title)
            
    def update_data(self, firstTimestamp, payload):
        self.figurePanel.newData = True
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
    
    def __init__(self, parent, ID, ctrl, figurePanel=None, config=None):
        self.key = ""
        self.xMin = 0
        self.useTime = True
        super(TimeLineChannelBox, self).__init__(parent, ID, ctrl, 
                            name="Timeline", figurePanel=figurePanel, config=config)
        self.plot_data = self.figurePanel.axes.plot([], linewidth=1,color=self.colour,)[0]
        
    def _create_elements(self, config):

        if config == None:
            #Create empty config, since it will be filled with defaults afterwards anyways
            config = {}
        # Fill potentially missing defaults:
        for k,v in self.defaults.items():
            if not k in config:
                config[k] = v
        
        parent = self.GetPane()
        self.activeCB = wx.CheckBox(parent, -1, "Active")
        self.activeCB.SetValue(config["active"])
        self.activeCB.Bind(wx.EVT_CHECKBOX, self.on_checkActive)    
        
        self.useTimeCB = wx.CheckBox(parent, -1, "Use Time")
        self.useTime = config["useTime"]
        self.useTimeCB.SetValue(self.useTime)
        self.useTimeCB.Bind(wx.EVT_CHECKBOX, self.on_checkUseTime)
        
        box = wx.StaticBox(parent, -1, "")
        sizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        
        catLabel = wx.StaticText(parent, -1, "Category: ")
        self.category = config["category"]
        self.catText = wx.TextCtrl(parent, -1, self.category, size=(100,-1))

        self.catText.Bind(wx.EVT_TEXT_ENTER, self.on_catText_enter)   
        self.catText.Bind(wx.EVT_KILL_FOCUS, self.on_catText_enter)
        
        category_box = wx.BoxSizer(wx.HORIZONTAL)
        category_box.Add(catLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        category_box.Add(self.catText, flag=wx.ALIGN_CENTER_VERTICAL)
        
        keyLabel = wx.StaticText(parent, -1, "Payload Key: ")
        self.key = config["key"]
        self.keyText = wx.TextCtrl(parent, -1, self.key, size=(100,-1))
        
        self.keyText.Bind(wx.EVT_TEXT_ENTER, self.on_keyText_enter)         
        self.keyText.Bind(wx.EVT_KILL_FOCUS, self.on_keyText_enter)

        
        key_box = wx.BoxSizer(wx.HORIZONTAL)
        key_box.Add(keyLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        key_box.Add(self.keyText, flag=wx.ALIGN_CENTER_VERTICAL)

        self.colourPicker = wx.ColourPickerCtrl(parent, -1)
        self.colour = (float(config["color"][0])/255, float(config["color"][1])/255,float(config["color"][2])/255)
        self.colourPicker.SetColour(config["color"])
        self.colourPicker.Bind(wx.EVT_COLOURPICKER_CHANGED, self.on_colourChange)
        
        self.clear_button = wx.Button(parent, -1, "Clear")
        self.Bind(wx.EVT_BUTTON, self.on_clear_button, self.clear_button)
        
        self.remove_button = wx.Button(parent, -1, "Remove")
        self.Bind(wx.EVT_BUTTON, self.on_remove_button, self.remove_button)
        
        figureLabel = wx.StaticText(parent, -1, "Show in figure: ")
        self.figureCB = wx.ComboBox(parent, value=self.style, size=(80, 30), choices=self.ctrl.get_figures(), 
            style=wx.CB_READONLY)
        self.figureCB.SetValue("Main")
        self.figureCB.Bind(wx.EVT_COMBOBOX, self.on_figure_select)
        
        figureBox = wx.BoxSizer(wx.HORIZONTAL)
        figureBox.Add(figureLabel, flag=wx.ALIGN_CENTER_VERTICAL)
        figureBox.Add(self.figureCB, flag=wx.ALIGN_CENTER_VERTICAL)
        
        styles = ['-','*','.','--', ':', 'd']
        self.style = config["style"]
        self.lineStyleCB = wx.ComboBox(parent, value=self.style, size=(60, 30), choices=styles, 
            style=wx.CB_READONLY)
        
        self.lineStyleCB.Bind(wx.EVT_COMBOBOX, self.on_StyleSelect)
        
        sizer.Add(category_box, 0, wx.ALL, 10)
        sizer.Add(key_box, 0, wx.ALL, 10)
        hbox = wx.BoxSizer(wx.HORIZONTAL)
        hbox.Add(self.colourPicker, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox.Add(self.lineStyleCB, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        
        sizer.Add(hbox, 0, wx.ALL, 10)
        sizer.Add(figureBox, 0, wx.ALL, 10)
        hbox2 = wx.BoxSizer(wx.HORIZONTAL)
        hbox2.Add(self.clear_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox2.Add(self.remove_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)        
        
        sizer.Add(hbox2, 0, wx.ALL, 10)
        
        hbox3 = wx.BoxSizer(wx.HORIZONTAL)
        hbox3.Add(self.activeCB,border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        hbox3.Add(self.useTimeCB,border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        sizer.Add(hbox3, 0, wx.ALL, 10)
        
        parent.SetSizer(sizer)
        sizer.Fit(parent)
#        sizer.SetSizeHints(parent)
        self.catText.SetFocus()
        
        
    def updatePlotData(self):
        if self._isActive:
            with self.dataLock:
                if self.useTime:
                    self.plot_data.set_xdata(self.xData)
                else:
                    self.plot_data.set_xdata(range(len(self.yData))) 
                self.plot_data.set_ydata(self.yData)
        
    def on_keyText_enter(self, event):
        self.key = self.keyText.GetValue()
        
    def on_figure_select(self, event):
        figure = event.GetString()
        self.ctrl.change_figure(self, figure)
        
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
        self.figurePanel.newData = True
        timestamp = time.time()-firstTimestamp
        try:
            data = float(payload[self.key])
            self._addData(timestamp, data)
        except KeyError:
            self.ctrl.prepFlashMessage = "Key {} for category: {} not found. Will be ignored".format(self.key, self.category)
#            self._addData(timestamp, -0.1)
#            self.ctrl.disableChannelBuffer = self
      
      
class ChildFrame(wx.Frame):
    
    def __init__(self, parent, name, channel, position=None):
        super(ChildFrame, self).__init__(parent, -1, size=(400,200), title=name)
        self.parent = parent
        self.panel = FigurePanel(self, name, parent, channel)

        self.Bind(wx.EVT_CLOSE, self.on_close)
        if position:
            self.SetPosition(position)
        
    def on_close(self, event):
        self.parent.child_closed(self)
        
        
class FigurePanel(wx.Panel):
    
    def __init__(self, parent, name, ctrl, channel=None):
        super(FigurePanel, self).__init__(parent)
        self.parent = parent
        self.name = name
        self.dpi = 100
        self.fig = Figure((3.0, 3.0), dpi=self.dpi, )
        self.axes = self.fig.add_subplot(111)
        self.newData = False
        self.ctrl = ctrl
        pylab.setp(self.axes.get_xticklabels(), fontsize=8)
        pylab.setp(self.axes.get_yticklabels(), fontsize=8)
        self.axes.grid(True, color='gray')
#        self.Bind(wx.EVT_CLOSE, self.on_close)
        self.channels = []
        self.paused = False
        self.canvas = FigCanvas(self, -1, self.fig)
        
#        self.canvas = FigCanvas(self.fig)
        if channel:
            self.add_channel(channel)
            
#        self.background = self.canvas.copy_from_bbox(self.axes.bbox)
        self.toolbar = NavigationToolbar(self.canvas)
#        self.toolbar = NavigationToolbar(self.canvas, )
        self.toolbar.Realize()
        self.toolbar.DeleteToolByPos(7) #Deletes the adjust subplots button
        self.toolbar.DeleteToolByPos(2) #Deletes the forward button
        self.toolbar.DeleteToolByPos(1) #Deletes the backward button
        self.toolbar.DeleteToolByPos(0) #Deletes the home button
        
        self.pause_button = wx.Button(self, -1, "Pause")
        self.Bind(wx.EVT_BUTTON, self.on_pause_button, self.pause_button)
#        
        self.cb_grid = wx.CheckBox(self, -1, "Show Grid", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_grid, self.cb_grid)
        self.cb_grid.SetValue(True)
        
        self.cb_xlab = wx.CheckBox(self, -1, "Show X labels", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_xlab, self.cb_xlab)        
        self.cb_xlab.SetValue(True)

        self.cb_x_window = wx.CheckBox(self, -1, "Fixed X window", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_window, self.cb_x_window)        
        self.cb_x_window.SetValue(False)        
        
        self.cb_y_window = wx.CheckBox(self, -1, "Fixed Y window", style=wx.ALIGN_RIGHT)
        self.Bind(wx.EVT_CHECKBOX, self.on_cb_window, self.cb_y_window)     
        
        
        self.hboxCtrl = wx.BoxSizer(wx.HORIZONTAL)
        self.hboxCtrl.Add(self.toolbar, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxCtrl.Add(self.pause_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxCtrl.AddSpacer(20)
        self.hboxCtrl.Add(self.cb_grid, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxCtrl.AddSpacer(10)
        self.hboxCtrl.Add(self.cb_xlab, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxCtrl.AddSpacer(10)
        self.hboxCtrl.Add(self.cb_x_window, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxCtrl.AddSpacer(10)
        self.hboxCtrl.Add(self.cb_y_window, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)        
        
        self.vbox = wx.BoxSizer(wx.VERTICAL)
        self.vbox.Add(self.canvas, 1, flag=wx.LEFT | wx.TOP | wx.GROW)    
        self.vbox.Add(self.hboxCtrl, 0, flag=wx.ALIGN_LEFT | wx.TOP)
        
        self.SetSizer(self.vbox)
        self.vbox.Fit(self.parent)

    def add_channel(self, channel):
        self.channels.append(channel)
        channel.figurePanel = self
        channel.plot_data = self.axes.plot([], linewidth=1, color=channel.colour, marker="*", linestyle="")[0]
        channel._update_style()
        channel.figureCB.SetValue(self.name)
        
    def remove_channel(self, channel):
        self.channels.remove(channel)
        if channel.isActive:
            self.axes.lines.remove(channel.plot_data)
        if len(self.channels) == 0:
            self.ctrl.remove_figure(self)
        
    def draw_plot(self):
        """ Redraws the plot
        """
        if self.paused or not self.newData:
            return
        maxSize = 0
        ymin = 0
        ymax = 0
        xmin = 0
#     
        for channel in self.channels:
            maxSize = max(maxSize, channel.lastData)
            ymin = round(min(channel.minVal,ymin),0)
            ymax = round(max(channel.maxVal,ymax),1)
            xmin = min(xmin, channel.xMin)
#      
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
        
        for channel in self.channels:
            channel.updatePlotData()
            
#        self.canvas.restore_region(self.background)
#        self.axes.draw_artist(self.axes.patch)
#        for line in self.axes.lines:
#            self.axes.draw_artist(line)
        
#        for spine in self.axes.spines.values(): 
#            self.axes.draw_artist(spine)
#        self.axes.draw_artist(self.axes.xaxis)    
#        self.axes.draw_artist(self.axes.yaxis)   
#        print self.axes.labels
#        self.axes.draw_artist(self.axes.xticks)
#        num
        self.canvas.draw() #Costs a lot of CPU performance :-(
        self.newData = False
        
    def on_pause_button(self, event):
        self.paused = not self.paused
        label = "Resume" if self.paused else "Pause"
        self.pause_button.SetLabel(label)
        
    def on_cb_grid(self, event):
        # anecdote: axes.grid assumes b=True if any other flag is
        # given even if b is set to False.
        # so just passing the flag into the first statement won't
        # work.
        if self.cb_grid.IsChecked():
            self.axes.grid(True, color='gray')
        else:
            self.axes.grid(False)
#        self.canvas.draw()
#        lines = self.axes.lines
#        self.axes.lines = []
        self.canvas.draw()
#        self.background = self.canvas.copy_from_bbox(self.axes.bbox)
#        self.axes.lines = lines
        
    def on_cb_xlab(self, event):
        # Using setp here is convenient, because get_xticklabels
        # returns a list over which one needs to explicitly 
        # iterate, and setp already handles this.
        pylab.setp(self.axes.get_xticklabels(), 
            visible=self.cb_xlab.IsChecked())
#        lines = self.axes.lines
#        self.axes.lines = []
        self.canvas.draw()
#        self.background = self.canvas.copy_from_bbox(self.axes.bbox)
#        self.axes.lines = lines
        
    def on_cb_window(self, event):
#        self.axes.set_ybound(lower=-0.1, upper=1.1)
#        lines = self.axes.lines
#        self.axes.lines = []
        self.canvas.draw()
#        self.background = self.canvas.copy_from_bbox(self.axes.bbox)
#        self.axes.lines = lines

class GraphFrame(wx.Frame):
    """ The main frame of the application
    """
    title = 'Ipaaca Plot Visualisation.'
    
    def __init__(self, updateRate=100, configPath=None):
        wx.Frame.__init__(self, None, -1, self.title)
        self.outputBuffer = ipaaca.OutputBuffer("Ipaaca_Plot")
        self.inputBuffer = ipaaca.InputBuffer("Ipaaca_Plot")
        self.inputBuffer.register_handler(self.update_data)
        #self.data = [1]
        self.channels = []
        self.paused = False
        self.firstTime = None
        
        self.figurePlots = []
        
        self.create_menu()
        self.create_status_bar()
        self.create_main_panel()
        
        self.redraw_timer = wx.Timer(self)
        self.Bind(wx.EVT_TIMER, self.on_redraw_timer, self.redraw_timer)  
        self.redraw_timer.Start(updateRate)
        self.Bind(wx.EVT_CLOSE, self._when_closed)
        
        self.prepFlashMessage = None
        self.disableChannelBuffer = None
        self.newData = False
        self.figureCounter = 0

        if configPath:
            self._handle_config(configPath)
        
    def _when_closed(self, event):
        self.redraw_timer.Destroy()
        sys.exit(0)
        
        
    def get_figures(self):
        res = []
        for f in self.figurePlots:
            res.append(f.name)
        res.append("New")
        return res

    def activate_channel(self, channel):
        if not channel.category in self.inputBuffer._category_interests:
            self.inputBuffer.add_category_interests(channel.category)
        
        
    def update_data(self, iu, event_type, local):
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
        m_expt = menu_file.Append(-1, "Export plot\tCtrl-E", "Save main plot to file")
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
        #Hack panel position getter and setter to allow treating the control
        #window the same as the child windows when loading and saving configs
        self.panel.SetPosition = self.SetPosition
        self.panel.GetPosition = self.GetPosition
        
        self.figurePanel = FigurePanel(self.panel, "Main", self)
        self.figurePlots.append(self.figurePanel)
        
        self.addChannel_button = wx.Button(self.panel, -1, "Add Channel")
        self.Bind(wx.EVT_BUTTON, self.on_addTimelineChannel_button, self.addChannel_button)
        
        self.addDistChannel_button = wx.Button(self.panel, -1, "Add Distribution Channel")
        self.Bind(wx.EVT_BUTTON, self.on_addDistChannel_button, self.addDistChannel_button)
        
        self.clearAll_button = wx.Button(self.panel, -1, "Clear all")
        self.Bind(wx.EVT_BUTTON, self.on_clearAll_button, self.clearAll_button)

        
        self.hboxChannelCtrl = wx.BoxSizer(wx.HORIZONTAL)
        self.hboxChannelCtrl.Add(self.addChannel_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxChannelCtrl.Add(self.addDistChannel_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        self.hboxChannelCtrl.Add(self.clearAll_button, border=5, flag=wx.ALL | wx.ALIGN_CENTER_VERTICAL)
        
        self.hboxChannels = wx.BoxSizer(wx.HORIZONTAL)
        self.hboxSend = wx.BoxSizer(wx.HORIZONTAL)
        
        catLabel = wx.StaticText(self.panel, -1, "Category: ")
        self.catText = wx.TextCtrl(self.panel, -1, "", size=(100,-1))

        keyLabel = wx.StaticText(self.panel, -1, "Payload Key: ")
        self.keyText = wx.TextCtrl(self.panel, -1, "", size=(100,-1))
        
        payloadLabel = wx.StaticText(self.panel, -1, "Payload Value: ")
        self.payloadText = wx.TextCtrl(self.panel, -1, "", size=(200,-1))
        
        self.send_button = wx.Button(self.panel, -1, "Send")
        self.Bind(wx.EVT_BUTTON, self.on_send_button, self.send_button)
        
        self.hboxSend.Add(catLabel, 0, wx.ALL, 5)
        self.hboxSend.Add(self.catText, 0, wx.ALL, 5)
        self.hboxSend.Add(keyLabel, 0, wx.ALL, 5)
        self.hboxSend.Add(self.keyText, 0, wx.ALL, 5)
        self.hboxSend.Add(payloadLabel, 0, wx.ALL, 5)
        self.hboxSend.Add(self.payloadText, 0, wx.ALL, 5)
        self.hboxSend.Add(self.send_button, 0, wx.ALL, 5)

        self.vbox = wx.BoxSizer(wx.VERTICAL)
        self.vbox.Add(self.figurePanel, 1, flag=wx.ALL | wx.EXPAND)  
        self.vbox.Add(self.hboxChannelCtrl, 0, flag=wx.ALIGN_LEFT | wx.TOP)
        self.vbox.Add(self.hboxChannels, 0, flag=wx.ALIGN_LEFT | wx.TOP)

        self.vbox.Add(wx.StaticLine(self.panel), 0, wx.ALL|wx.EXPAND, 5)
        self.vbox.Add(self.hboxSend, 0, flag=wx.ALIGN_LEFT | wx.TOP)
        
        
        self.vbox.SetSizeHints(self)
        self.panel.SetSizer(self.vbox)
#        self.vbox.Fit(self)
        
    def child_closed(self, child):
        for c in child.panel.channels:
            self.change_figure(c, "Main")
        
    def remove_figure(self, figure):
        if figure.name != "Main":
            self.figurePlots.remove(figure)
            self.update_available_figures()
            figure.parent.Destroy()

    def change_figure(self, channel, figure, position=None):
        oldFigure = channel.figurePanel
        oldFigure.remove_channel(channel)
    
        for f in self.figurePlots:
            if f.name == figure:
                f.add_channel(channel)
                if position:
                    f.parent.SetPosition(position)
                break
        else:
            #Figure not found -> Create new one
            if figure == "New":
                figure =  "Figure"+str(self.figureCounter)
            newFrame = ChildFrame(self, figure, channel, position=position)
            newFrame.Show()
            self.figureCounter += 1
            self.figurePlots.append(newFrame.panel)
            self.update_available_figures()
        
    def update_available_figures(self):
        for c in self.channels:
            c.figureCB.Clear()
            for f in self.get_figures():
                c.figureCB.Append(f)
        
    def create_status_bar(self):
        self.statusbar = self.CreateStatusBar()

    def init_plot(self):
        self.dpi = 100
        self.fig = Figure((3.0, 3.0), dpi=self.dpi)

        self.axes = self.fig.add_subplot(111)
        
        pylab.setp(self.axes.get_xticklabels(), fontsize=8)
        pylab.setp(self.axes.get_yticklabels(), fontsize=8)
        

    def draw_plots(self):
        """ Trigger redraw in all figures
        """
        for f in self.figurePlots:
            f.draw_plot()
      
    def on_clearAll_button(self, event):
        for channel in self.channels:
            channel.on_clear_button(event)
        self.firstTime = None
        self.newData = True

    def on_send_button(self, event):
        cat = self.catText.GetValue()
        key = self.keyText.GetValue()
        payload = self.payloadText.GetValue()
        print("Sending %s to category %s" % ({key:payload}, cat))
        msg = ipaaca.Message(cat)
        msg.payload = {key:payload}
        self.outputBuffer.add(msg)
        
    def on_addDistChannel_button(self, event):
        newDistChannelBox = DistributionChannelBox(self.panel, -1, self)
        self._add_channelBox(newDistChannelBox)
    
    def on_addTimelineChannel_button(self, event):
        newChannelBox = TimeLineChannelBox(self.panel, -1, self)
        self._add_channelBox(newChannelBox)
        
        
    def _add_channelBox(self, channelBox):
        self.hboxChannels.Add(channelBox, 0, wx.ALL, 5)
        self.channels.append(channelBox)
        self.figurePanel.channels.append(channelBox)
        self.update_layout()
        
    def update_layout(self):
        self.vbox.SetSizeHints(self)
        self.vbox.Layout()
        self.Refresh()
        
    def removeChannel(self, channel):
        for c in self.channels:
            if c != channel and c.category == channel.category:
                break
        else:
            self.inputBuffer.remove_category_interests(channel.category)
        self.channels.remove(channel)
        self.hboxChannels.Remove(channel)
        pylab.setp(self.figurePanel.axes, title="")
        channel.Destroy()
        if len(self.channels) == 0:
            self.firstTime = None
        self.update_layout()
        
    
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
            self.figurePanel.canvas.print_figure(path, dpi=self.figurePanel.dpi)
            self.flash_status_message("Saved to %s" % path)
    
    def on_redraw_timer(self, event):
        self.draw_plots()
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
                newChannelBox = TimeLineChannelBox(self.panel, -1, self, config=channel["config"])
                
            elif channel["channeltype"] == "Distribution":
                newChannelBox = DistributionChannelBox(self.panel, -1, self, config=channel["config"])
                
            self._add_channelBox(newChannelBox)
            newChannelBox._update_style() #Needs to be done after it was created.
            try:
                newChannelBox._change_activity(channel["config"]["active"]) #To potentially start the recording
            except KeyError:
                #Ignore potentially missing active
                pass
            try:
                self.change_figure(newChannelBox, channel["config"]["figure"], position= channel["config"]["figurePos"])
            except KeyError:
                #Ignore potentially missing figure or figurePos attribute
                pass
                
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
                channelObject = {"config": {"category": channel.category,
                                            "color": [int(channel.colour[0]*255),int(channel.colour[1]*255),int(channel.colour[2]*255)],
                                            "figure": channel.figurePanel.name,          
                                            "figurePos": list(channel.figurePanel.parent.GetPosition()),
                                            "style":channel.style,
                                            "active":channel._isActive,
                                            "collapsed": channel.IsCollapsed()}}

                if isinstance(channel, TimeLineChannelBox):
                    channelObject["channeltype"] =  "Timeline"
                    channelObject["config"].update({"key": channel.key,
                                                    "useTime": channel.useTime})
                elif isinstance(channel, DistributionChannelBox):
                    channelObject["channeltype"] =  "Distribution"
                    channelObject["config"].update({"xKey": channel.xKey,
                                                    "yKey": channel.yKey})
                    
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
    import argparse
    
    parser = argparse.ArgumentParser(description="Plots timelines and distributions send via Ipaaca")
    parser.add_argument("config", nargs="?", default=None, help="Path to config file that should be loaded directly.")
    parser.add_argument("-u", "--updateRate", default=100, type=int, help="Update rate in ms that should be used. Default 100ms.")
  
    args = parser.parse_args()
    app = wx.PySimpleApp()
    app.frame = GraphFrame(updateRate=args.updateRate, configPath = args.config)

    app.frame.Show()
    app.MainLoop()

