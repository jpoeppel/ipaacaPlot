import './index.css';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Dashboard from "./components/dashboard";

import CanvasComponent from "./components/gridworld.js";
import Element from "./components/element.js";
import CustomSlider from "./components/slider.js";

import Webblocks from "./components/webblocks.js"


/*
if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}
*/


ReactDOM.render(
  // <Dashboard >
  // </Dashboard>
  <Webblocks />,
  document.getElementById('dashboard')
);
