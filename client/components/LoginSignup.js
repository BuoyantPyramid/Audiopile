import React, { PropTypes } from 'react';
import { browserHistory, Router, Route, Link } from 'react-router';

class Login extends React.Component {
  render() {
    return (
      <div>
        <h3>Sign in or create an account</h3>
        <input ref={ node => {this.input = node;} } />
        <button onClick={ () => {
          store.dispatch({
            type: 'UPDATE_USER',
            email: this.input.value,
          });
        } }>
        Login
        </button>
      </div>
    );
  }
}

export default Login;