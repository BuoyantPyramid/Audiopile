import * as ActionTypes from '../actions'
import { createStore, combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import auth from './auth';


// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}



const rootReducer = combineReducers({
  auth,
  errorMessage,
  routing
});

export default rootReducer;