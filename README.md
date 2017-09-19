# WebPlot branch

In this branch I am exploring the idea of getting rid of platform dependent native GUI-Frameworks (currently ipaacaPlot uses wx which is not easiliy installed across systems or Python-versions) in favor of web-based rendering. The plotting work will be done using a combination of react.js and d3.js while the Python-Flask-Backend handles communication with (potentially several) middlewares.

While there exist a few frameworks for combining react and d3 (e.g. reactd3.org, rd3 https://github.com/yang-wei/rd3 and many small others), most of those use d3 v3 and/or are searching for new maintainers. On top of this, I wanted to get my hands dirty myself, to familiarize myself more with both react and d3 so I currently wrote the charts as they are now myself, taking inspiration from various projects I could find, usually conferting them to es2015 and d3 v4.

**Update**: I found [Victory](https://formidable.com/open-source/victory/) yesterday, which is maintained, well documented, uses modern standards (ES6 and d3 v4) and seems to be highly configurable. Therfore, after proving to myself that I can get simple charts to work myself, I am currently considering leaving the actual charting to people more familiar with d3,js and webvisualisation to concentrate on the actual features I want from this dashboard/dynamic visualisation app.

**Update 2**: Naive streaming based components based on Victory quickly became very slow, basically rendering Firefox (and Chrome) useless after receiving a few thousand datapoints. It is very likely that I can optimize this by diving deeper into Victory but for my initial Use-Case of only requirering Line- and Barplots this might not be worth it. Instead I am currently experimenting with [react-vis](https://github.com/uber/react-vis), a smaller library with simpler structure (I can actually quickly understand what they are doing where), which also provides a canvas version of basically all their supported graphs, so that one can easily implement switching between canvas and svg if performance becomes an issue. 
Main problem currently: When only looking at a limited xDomain, the series are not truncated on the left (y-axis), a problem that the SVG-Version can circumvent using borders, that hide the additional data, but this is not yet available for the canvas versions.

I hope to be able to develop features on par with the native version of ipaacaPlot soon, i.e.:

* specification of different channels for line- and barplots 
    * This obviously includes updating the plots with streamed data
    * **Done**
* specifying in which panel to add a the plot
    * **Done**
* configuring colors and symbols/glyphs 
    * **Done** at least in a basic fashion
* Showing sliding windows or entire plot for lineplots
    * **Done** with a hardcoded window for now, needs to be improved!
* Allow pausing the updates!
* Allowing to zoom and pan in plots
* saving and loading configurations
* hiding of the controls
* Saving plots as png/svg/pdf

As well as additional features:

* Mouse-over tooltips
* Syncronization between plots
* Pause and step functions which allow to step through the data incrementally as they came (syncronized over all connected plots)
* Custom canvases, e.g. my webblots maze as a special kind of "plot" which can be synchronized to the rest (TODO: Decide how to handle this programmatically, include webblocks code in this repository, or provide a way to load this dynamically)
* ...

### Usage

Currently the frontend would need to be build using npm first (alternatively start the debugging client using ```
npm start```) and run the webserver using ```python run.py```. 

You can subscribe to channels using the web UI. Channels are specified as:

[protocol:]channelName

If protocol ist not given, rsb is currently assumed as default. As an example, if you want to subscribe to the ipaaca category "data" you would specify:
```
ipaaca:data
```
when adding the channel.

Currently the frontend assumes for LinePlots that the msg contains a field "y" with a list containing the new value as value.
BarPlots assume a field "dist" containing the ordered values for the plot. You can look at "testDistribution.py" for example data for both plots.

**WARNING** Both will be changed soonish!


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
