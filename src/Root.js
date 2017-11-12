import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';

import App from './Main/App';
import ErrorBoundary from './Main/ErrorBoundary';
import reducers from './reducers';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    applyMiddleware(middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

const Root = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/report/:reportCode/:fightId/:playerName/:resultTab" component={App} />
          <Route path="/report/:reportCode/:fightId/:playerName" component={App} />
          <Route path="/report/:reportCode/:fightId" component={App} />
          <Route path="/report/:reportCode" component={App} />
          <Route path="/" component={App} />
        </Switch>
      </ConnectedRouter>
    </ErrorBoundary>
  </Provider>
);

export default Root;
