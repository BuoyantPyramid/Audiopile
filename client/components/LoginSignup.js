import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../actions';

let LoginSignup = ({ dispatch }) => {
  let input;

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return;
        }
        dispatch(updateUser(input.value));
        input.value = '';
      }}>
        <input ref={node => {
          input = node;
        }} />
        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
};
LoginSignup = connect()(LoginSignup);


export default LoginSignup;