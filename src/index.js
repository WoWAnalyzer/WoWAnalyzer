import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import './static/bootstrap/css/bootstrap.css';

import App from './Main/App';

import { unregister } from './registerServiceWorker';

window.onerror = function (message, url, lineNo, colNo, error) {
  console.log(arguments);

  const container = document.createElement('div');
  container.style.color = 'red';
  container.style.position = 'fixed';
  container.style.background = '#eee';
  container.style.padding = '2em';
  container.style.top = '1em';
  container.style.left = '1em';

  const msg = document.createElement('pre');
  msg.innerText = [
    'Message: ' + message,
    'URL: ' + url,
    'Line: ' + lineNo,
    'Column: ' + colNo,
    'Stack: ' + (error && error.stack),
  ].join('\n');

  container.appendChild(msg);

  document.body.appendChild(container);
};


render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="report/:reportCode" />
      <Route path="report/:reportCode/:fightId" />
      <Route path="report/:reportCode/:fightId/:playerName" />
      <Route path="report/:reportCode/:fightId/:playerName/:resultTab" />
    </Route>
  </Router>,
  document.getElementById('root')
);
unregister();
