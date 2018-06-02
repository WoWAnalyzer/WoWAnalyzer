import Raven from 'raven-js';

export function install() {
  if (process.env.NODE_ENV === 'production') {
    Raven.config(process.env.REACT_APP_RAVEN_DSN).install();
  }
}

export function captureException(exception, options) {
  if (process.env.NODE_ENV === 'production') {
    Raven.captureException(exception, options);
  }
}
