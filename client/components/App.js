import React from 'react';
import { browserHistory, Router, Route, Link } from 'react-router';
import { Provider } from 'react-redux';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Slack for SoundCloud!</h1>
        <ul>
          <li><Link to="/login">Login</Link></li>
        </ul>
        {this.props.children}
      </div>
    );
  }
}

export default App;