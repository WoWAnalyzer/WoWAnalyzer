import { useEffect } from 'react';
import { render } from 'react-dom';
import * as Sentry from '@sentry/react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

// @ts-expect-error types/core-js doesn't include the type for this i guess
import at from 'core-js/actual/array/at';

import 'interface/static/bootstrap/css/bootstrap.css';

import Root from './Root';

// we are intentionally polyfilling `at` here when missing because we use
// it frequently and its addition to browsers is quite recent
if (Array.prototype.at === undefined) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.at = at;
}

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],

    release: import.meta.env.VITE_VERSION,
    environment: import.meta.env.VITE_ENVIRONMENT_NAME,
    allowUrls: ['wowanalyzer.com/assets/'],

    beforeSend(event) {
      // this is *an attempt* to keep sentry from sending up user info that we don't want & don't need
      if (event.user) {
        delete event.user;
      }

      return event;
    },

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/wowanalyzer\.com\/i/],

    ignoreErrors: [/TypeError: Failed to fetch/, /Failed to fetch/],
  });

  Sentry.setUser(null);
}

render(<Root />, document.getElementById('app-mount'));
