import './index.css';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Dashboard from "./components/dashboard";

import CanvasComponent from "./components/gridworld.js";
import Element from "./components/element.js"
/*
if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}
*/
let map = [
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "green",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "green",
      "symbol": "S"
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "green",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "green",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": true,
      "color": "",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ],
  [
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    },
    {
      "passable": false,
      "color": "rgba(96,96,96,1)",
      "symbol": ""
    }
  ]
];

ReactDOM.render(

  

  <Dashboard >
    <Element>
      <CanvasComponent bgname={"bg"} fgname={"fg"} width={600} height={400} map={map} pos={[3,3]}/>
    </Element>
  </Dashboard>,
  document.getElementById('dashboard')
);
