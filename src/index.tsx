import './instrumentation';
import 'interface/static/bootstrap/css/bootstrap.css';

import { createRoot } from 'react-dom/client';

// @ts-expect-error types/core-js doesn't include the type for this i guess
import at from 'core-js/actual/array/at';

import Root from './Root';
import { reactErrorHandler } from '@sentry/react';

// we are intentionally polyfilling `at` here when missing because we use
// it frequently and its addition to browsers is quite recent
if (Array.prototype.at === undefined) {
  Array.prototype.at = at;
}

const container = document.getElementById('app-mount')!;
const root = createRoot(container, {
  onUncaughtError: import.meta.env.VITE_SENTRY_DSN ? reactErrorHandler() : undefined,
  onCaughtError: import.meta.env.VITE_SENTRY_DSN ? reactErrorHandler() : undefined,
  onRecoverableError: import.meta.env.VITE_SENTRY_DSN ? reactErrorHandler() : undefined,
});
root.render(<Root />);
