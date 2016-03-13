// user login and signup reducer

import * as types from '../constants/actionTypes';

const initialState = {
  email: null,
  displayName: null,
  avatar: ''
};

// export a switch function
export default function authed(state = initialState, action) {
  switch(action.type) {
  case types.UPDATE_USER:
      return Object.assign({}, state, {
          email: action.email,
          displayName: action.display_name,
          avatar: action.avatar
      });
  default:
      return state;
  }
}