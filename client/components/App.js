import React from 'react';
import { browserHistory, Router, Route, Link } from 'react-router';
import { Provider } from 'react-redux';
import store from '../store/store';

class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <h1>Slack for SoundCloud!</h1>
        <Login email={store.getState().email}/>
      </Provider>
    );
  }
}

export default App;