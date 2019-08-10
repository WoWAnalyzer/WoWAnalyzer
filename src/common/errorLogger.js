export function captureException(exception, options) {
  if (process.env.NODE_ENV === 'production') {
    console.error('An error occured and was sent to Sentry.', exception);
    window.Sentry && window.Sentry.withScope(scope => {
      if (options && options.extra) {
        scope.setExtras(options.extra);
      }
      window.Sentry.captureException(exception);
    });
  } else {
    throw exception;
  }
}

