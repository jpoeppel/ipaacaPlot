# ipaacaPlot
A simple visualization tool that plots realtime data received via the Ipaaca[1] middleware.

Uses wx and matplotlib to plot either timedate or distriputions that are send via Ipaaca on arbitrary channels/categories.

### Usage:
```
python ipaacaPlot [path_to_config]
```

### Requirements

ipaacaPlot is build upon the following 3rd party dependencies:

* wxpython (GUI elements)
* matplotlib (actual plotting)
* ipaaca[1] (to receive the messages that are being plottet)


[1] http://asap-project.ewi.utwente.nl/wiki/Ipaaca
