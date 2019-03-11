import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';

import reducers from 'interface/reducers';
import RootErrorBoundary from 'interface/RootErrorBoundary';
import App from 'interface/App';
import RootLocalizationProvider from 'interface/RootLocalizationProvider';
import { Provider } from 'interface/LocationContext';

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
  <ReduxProvider store={store}>
    <RootErrorBoundary>
      <RootLocalizationProvider>
        <ConnectedRouter history={history}>
          <Provider>
            <App />
          </Provider>
        </ConnectedRouter>
      </RootLocalizationProvider>
    </RootErrorBoundary>
  </ReduxProvider>
);

export default Root;
