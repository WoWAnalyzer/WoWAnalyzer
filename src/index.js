import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import './static/bootstrap/css/bootstrap.css';

import App from './Main/App';

import ErrorBoundary from './Main/ErrorBoundary';
import { unregister } from './registerServiceWorker';

// Source: https://docs.sentry.io/clients/javascript/usage/#promises
window.onunhandledrejection = function(evt) {
  Raven && Raven.captureException(evt.reason); // eslint-disable-line no-undef
};

render(
  <ErrorBoundary>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <Route path="report/:reportCode" />
        <Route path="report/:reportCode/:fightId" />
        <Route path="report/:reportCode/:fightId/:playerName" />
        <Route path="report/:reportCode/:fightId/:playerName/:resultTab" />
      </Route>
    </Router>
  </ErrorBoundary>,
  document.getElementById('app-mount')
);
unregister();
