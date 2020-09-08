import * as SentryType from '@sentry/browser';

declare global {
  // May be undefined when adblockers block Sentry (for privacy concerns)
  interface Window { Sentry: typeof SentryType | undefined }
}
