# WebPlot branch

In this branch I am exploring the idea of getting rid of platform dependent native GUI-Frameworks (currently ipaacaPlot uses wx which is not easiliy installed across systems or Python-versions) in favor of web-based rendering. The plotting work will be done using a combination of react.js and d3.js while the Python-Flask-Backend handles communication with (potentially several) middlewares.

While there exist a few frameworks for combining react and d3 (e.g. reactd3.org, rd3 https://github.com/yang-wei/rd3 and many small others), most of those use d3 v3 and/or are searching for new maintainers. On top of this, I wanted to get my hands dirty myself, to familiarize myself more with both react and d3 so I currently wrote the charts as they are now myself, taking inspiration from various projects I could find, usually conferting them to es2015 and d3 v4.

I hope to be able to develop features on par with the native version of ipaacaPlot soon, i.e.:

* specification of different channels for line- and barplots 
    * This obviously includes updating the plots with streamed data
* specifying in which panel to add a the plot
* configuring colors and symbols/glyphs 
* Showing sliding windows or entire plot for lineplots
* Allowing to zoom and pan in plots
* saving and loading configurations
* hiding of the controls

As well as additional features:

* Mouse-over tooltips
* Syncronization between plots
* Pause and step functions which allow to step through the data incrementally as they came (syncronized over all connected plots)
* Custom canvases, e.g. my webblots maze as a special kind of "plot" which can be synchronized to the rest (TODO: Decide how to handle this programmatically, include webblocks code in this repository, or provide a way to load this dynamically)
* ...



# ipaacaPlot
A simple visualization tool that plots realtime data received via the Ipaaca[1] middleware.

Uses wx and matplotlib to plot either timedate or distributions that are send via Ipaaca on arbitrary channels/categories.

### Usage:

Starting the ipaacaPlot is as simple as:
```
python ipaacaPlot [path_to_config]
```

### Usage-Accepted IUs

ipaacaPlot currently accepts 2 kinds of signals:

1. Timeline data: In this mode, the user specifies a IU category and a payload key. The data coming over that category and corresponding to the given key is collected online and is plotted either against the time of arrival or simply their order of arrival. Example payload for plotting the probability P(A=a): `{"P(A=a)": 0.1}`
2. Distribution data: In this mode, the user specifies a IU category, a payload key containing the distribution bins, and a payload key containing the distribution values. The data in distribution plots is currently always overwritten with the last received data, i.e. there is not history as in timeline data, but one can see the entire distribution over the specified bins at one glance. Example payload for the entire distribution P(A): `{"bins": ["A=a","A=b","A=c"], "values": [0,1,0.6,0.3]}`


### Requirements

ipaacaPlot is build upon the following 3rd party dependencies:

* wxpython (GUI elements)
* matplotlib (actual plotting)
* ipaaca (to receive the messages that are being plottet)


[1] https://github.com/SocialCognitiveSystems/ipaaca
