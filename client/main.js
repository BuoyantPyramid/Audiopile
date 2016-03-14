// This is the entry point for webpack

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import authReducer from './reducers/auth';
import Login from './components/LoginSignup';
import App from './containers/App';
import store from './store/configureStore';

// Add the reducer to your store on the `routing` key

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
    <Router history={ history }>
      <Route path='/' component={App}>
        <Route path='/login' component={Login}>
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);