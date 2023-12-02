import { captureException as sentryCaptureException, withScope } from '@sentry/react';

export function captureException(
  exception: Error,
  options?: {
    extra?: Record<string, unknown>;
    contexts?: { react: { componentStack: unknown } };
  },
) {
  if (process.env.NODE_ENV === 'production') {
    console.error('An error occurred and was sent to Sentry.', exception);
    withScope((scope) => {
      if (options && options.extra) {
        scope.setExtras(options.extra);
      }
      sentryCaptureException(exception);
    });
  } else {
    throw exception;
  }
}
