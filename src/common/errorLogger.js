import Raven from 'raven-js';

export function install() {
  if (process.env.NODE_ENV === 'production') {
    Raven.config('https://95bf5a7af57f4a57af1f1be4d0706a91@sentry.io/232829').install();
  }
}

export function captureException(exception, options) {
  if (process.env.NODE_ENV === 'production') {
    Raven.captureException(exception, options);
  }
}
