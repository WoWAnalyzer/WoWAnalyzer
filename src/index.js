import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import './static/bootstrap/css/bootstrap.css';

import App from './Main/App';

render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="report/:reportCode" />
      <Route path="report/:reportCode/:fightId" />
      <Route path="report/:reportCode/:fightId/:playerName" />
      <Route path="report/:reportCode/:fightId/:playerName/:resultTab" />
    </Route>
  </Router>,
  document.getElementById('root')
);
