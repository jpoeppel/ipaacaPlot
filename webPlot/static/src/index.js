import './index.css';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Dashboard from "./components/dashboard";

/*
if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}
*/


ReactDOM.render(
  <Dashboard >
      <div>
          <h1>Hallo welt</h1>
      </div>
  </Dashboard>,
  document.getElementById('dashboard')
);
