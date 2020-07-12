import * as SentryType from '@sentry/browser';

declare global {
  // May be undefined when adblockers block Sentry (for privacy concerns)
  const Sentry: typeof SentryType | undefined;
}
