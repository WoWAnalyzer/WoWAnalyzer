import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import App from './Main/App';
import ErrorBoundary from './Main/ErrorBoundary';

const Root = () => (
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
);

export default Root;
