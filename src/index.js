import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import './bootstrap/css/bootstrap.css';

import App from './Main/App';

render(
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <Route path='report/:reportCode' />
      <Route path='report/:reportCode/:playerName' />
      <Route path='report/:reportCode/:playerName/:fightId' />
      <Route path='report/:reportCode/:playerName/:fightId/:resultTab' />
    </Route>
  </Router>,
  document.getElementById('root')
);
