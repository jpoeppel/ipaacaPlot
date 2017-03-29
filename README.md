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
