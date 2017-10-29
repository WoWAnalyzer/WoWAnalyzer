import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import './static/bootstrap/css/bootstrap.css';

import App from './Main/App';

import ErrorBoundary from './Main/ErrorBoundary';
import { unregister } from './registerServiceWorker';

function isError(x) {
  return x instanceof Error;
}
function toMessage(x) {
  return isError(x) ? x.message : x;
}
function toStack(x) {
  return isError(x) ? x.stack : undefined;
}

window.addEventListener('unhandledRejection', event => {
  const message = toMessage(event);
  console.error(`Unhandled rejection: ${message}`);
  Raven && Raven.captureException(new Error('Unhandled promise rejection'), { // eslint-disable-line no-undef
    extra: {
      reason: message,
      stack: toStack(event),
    },
  });
});

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
