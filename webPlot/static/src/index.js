import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from "./components/dashboard";

import Webblocks from "./components/webblocks.js"


/*
if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}
*/


ReactDOM.render(
  <Dashboard >
  </Dashboard>,
  // <Webblocks />,
  document.getElementById('dashboard')
);
