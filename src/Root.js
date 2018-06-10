import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';

import App from './Main/App';
import reducers from './reducers';
import RootErrorBoundary from './RootErrorBoundary';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

const store = createStore(
  reducers,
  composeWithDevTools(
    applyMiddleware(thunk, middleware)
  )
);

const Root = () => (
  <Provider store={store}>
    <RootErrorBoundary>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </RootErrorBoundary>
  </Provider>
);

export default Root;
