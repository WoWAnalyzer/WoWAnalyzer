import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
// noinspection ES6CheckImport
import { I18nProvider } from '@lingui/react';

import reducers from 'Interface/reducers';
import RootErrorBoundary from 'Interface/RootErrorBoundary';
import LocalizationLoader from 'Interface/LocalizationLoader';
import App from 'Main/App';

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
      <LocalizationLoader>
        {({ language, catalogs }) => (
          <I18nProvider language={language} catalogs={catalogs}>
            <ConnectedRouter history={history}>
              <App />
            </ConnectedRouter>
          </I18nProvider>
        )}
      </LocalizationLoader>
    </RootErrorBoundary>
  </Provider>
);

export default Root;
