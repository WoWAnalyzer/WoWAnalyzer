import React from 'react';
import { render } from 'react-dom';
import { install, captureException } from 'common/errorLogger';

import './static/bootstrap/css/bootstrap.css';

import Root from './Root';
import { unregister } from './registerServiceWorker';

install();
// Source: https://docs.sentry.io/clients/javascript/usage/#promises
window.onunhandledrejection = function (evt) {
  captureException(evt.reason);
};

render(<Root />, document.getElementById('app-mount'));
unregister();
