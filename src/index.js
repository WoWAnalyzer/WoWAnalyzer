import React from 'react';
import { render } from 'react-dom';

import './static/bootstrap/css/bootstrap.css';

import Root from './Root';
import { unregister } from './registerServiceWorker';

// Source: https://docs.sentry.io/clients/javascript/usage/#promises
window.onunhandledrejection = function (evt) {
  Raven && Raven.captureException(evt.reason); // eslint-disable-line no-undef
};

render(<Root />, document.getElementById('app-mount'));
unregister();
