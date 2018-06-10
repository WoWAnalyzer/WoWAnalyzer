import Raven from 'raven-js';

export function install() {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_RAVEN_DSN) {
      Raven.config(process.env.REACT_APP_RAVEN_DSN).install();
    } else {
      console.warn('Unable to install Raven, missing DSN.');
    }
  }
}

export function captureException(exception, options) {
  if (process.env.NODE_ENV === 'production') {
    Raven.captureException(exception, options);
  }
}
