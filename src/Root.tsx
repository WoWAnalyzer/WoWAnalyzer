import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

import createReducers from 'interface/reducers';
import RootErrorBoundary from 'interface/RootErrorBoundary';
import App from 'interface/App';

import I18nProvider from './localization/I18nProvider';

const store = createStore(createReducers(), composeWithDevTools(applyMiddleware(thunk)));

const Root = () => (
  <ReduxProvider store={store}>
    <I18nProvider>
      {/* We need to place the error boundary inside all providers since it uses i18n for localized messages. */}
      <RootErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RootErrorBoundary>
    </I18nProvider>
  </ReduxProvider>
);

export default Root;
