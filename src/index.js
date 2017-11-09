import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import './static/bootstrap/css/bootstrap.css';

import App from './Main/App';

import ErrorBoundary from './Main/ErrorBoundary';
import { unregister } from './registerServiceWorker';
import reducers from './reducers';

// Source: https://docs.sentry.io/clients/javascript/usage/#promises
window.onunhandledrejection = function (evt) {
  Raven && Raven.captureException(evt.reason); // eslint-disable-line no-undef
};

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

render(
  <Provider store={store}>
    <ErrorBoundary>
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <Route path="report/:reportCode" />
          <Route path="report/:reportCode/:fightId" />
          <Route path="report/:reportCode/:fightId/:playerName" />
          <Route path="report/:reportCode/:fightId/:playerName/:resultTab" />
        </Route>
      </Router>
    </ErrorBoundary>
  </Provider>,
  document.getElementById('app-mount')
);
unregister();
