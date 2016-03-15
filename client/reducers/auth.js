// user login and signup reducer
import * as ActionTypes from '../actions'

const initialState = {
  email: null,
  displayName: null,
  avatar: ''
};

// export a switch function
const auth = function authed(state = initialState, action) {
  switch(action.type) {
  case ActionTypes.UPDATE_USER:
    return Object.assign({}, state, {
      email: action.email,
      displayName: action.display_name,
      avatar: action.avatar
    });
  default:
    return state;
  }
};

export default auth;