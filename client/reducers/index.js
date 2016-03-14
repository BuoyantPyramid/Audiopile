import { createStore, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import auth from './auth';

const rootReducer = createStore(
  combineReducers(
    Object.assign({}, auth,
    {routing: routerReducer})
  ) 
);

export default rootReducer;