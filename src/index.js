import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './static/bootstrap/css/bootstrap.css';

import App from './Main/App';

import ErrorBoundary from './Main/ErrorBoundary';
import { unregister } from './registerServiceWorker';

// Source: https://docs.sentry.io/clients/javascript/usage/#promises
window.onunhandledrejection = function (evt) {
  Raven && Raven.captureException(evt.reason); // eslint-disable-line no-undef
};

render(
  <ErrorBoundary>
    <BrowserRouter>
      <Switch>
        <Route path="/report/:reportCode/:fightId/:playerName/:resultTab" component={App} />
        <Route path="/report/:reportCode/:fightId/:playerName" component={App} />
        <Route path="/report/:reportCode/:fightId" component={App} />
        <Route path="/report/:reportCode" component={App} />
        <Route path="/" component={App} />
      </Switch>
    </BrowserRouter>
  </ErrorBoundary>,
  document.getElementById('app-mount')
);
unregister();
