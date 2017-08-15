import sys

sys.path.append("/homes/jpoeppel/repo/ipaaca/ipaacalib/python/build")

from webPlot import app
from webPlot import socketio


if __name__ == "__main__":
    socketio.run(app, host=app.config["HOST"], port=app.config["PORT"], debug= True)
