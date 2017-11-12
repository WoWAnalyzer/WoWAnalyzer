import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import App from './Main/App';
import ErrorBoundary from './Main/ErrorBoundary';
import reducers from './reducers';

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

const Root = () => (
  <Provider store={store}>
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
    </ErrorBoundary>
  </Provider>
);

export default Root;
