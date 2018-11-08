import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from "./components/dashboard2";

import Webblocks from "./components/webblocks.js"

import { Provider } from 'react-redux'
import { createStore } from 'redux'

import configureStore from './store'

/*
if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}
*/

const store = configureStore({})

ReactDOM.render(
  <Provider store={store}>
    <Dashboard >
    </Dashboard>
    {/* <Webblocks /> */}
  </Provider>,
  document.getElementById('dashboard')
);
