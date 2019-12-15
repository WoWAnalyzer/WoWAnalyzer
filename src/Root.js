import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';

import createReducers from 'interface/reducers';
import RootErrorBoundary from 'interface/RootErrorBoundary';
import App from 'interface/App';
import RootLocalizationProvider from 'interface/RootLocalizationProvider';

const history = createBrowserHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

const store = createStore(
  createReducers(history),
  composeWithDevTools(
    applyMiddleware(thunk, middleware),
  ),
);

const Root = () => (
  <ReduxProvider store={store}>
    <RootErrorBoundary>
      <RootLocalizationProvider>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </RootLocalizationProvider>
    </RootErrorBoundary>
  </ReduxProvider>
);

export default Root;
