import App from 'interface/App';
import createReducers from 'interface/reducers';
import RootErrorBoundary from 'interface/RootErrorBoundary';
import React, { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import I18nProvider from './localization/I18nProvider';

const store = createStore(createReducers(), composeWithDevTools(applyMiddleware(thunk)));

interface Props {
  children?: ReactNode;
}

const Root = ({ children }: Props) => (
  <ReduxProvider store={store}>
    <I18nProvider>
      {/* We need to place the error boundary inside all providers since it uses i18n for localized messages. */}
      <RootErrorBoundary>
        <BrowserRouter>{children || <App />}</BrowserRouter>
      </RootErrorBoundary>
    </I18nProvider>
  </ReduxProvider>
);

export default Root;
