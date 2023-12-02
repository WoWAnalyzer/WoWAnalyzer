import { Trans } from '@lingui/macro';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ReactNode } from 'react';

declare global {
  interface Window {
    errors?: Error[];
  }
}

const Fallback = ({
  componentStack,
  error,
  eventId,
}: {
  error: Error;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}) => (
  <div className="alert alert-danger">
    <h1 style={{ marginTop: 0 }}>
      <Trans id="interface.common.errorBoundary.error">
        An error occurred while trying to render this part of the page.
      </Trans>
    </h1>
    <p className="text-muted">
      <Trans id="interface.common.errorBoundary.bug">
        This is usually caused by a bug in our code. If you're handy with computers please consider
        sending us a Pull Request with a fix on{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a>. Otherwise please let us
        know in an issue on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or leave
        us a message on <a href="https://wowanalyzer.com/discord">Discord</a> so we can fix it for
        you.
      </Trans>
    </p>

    <h1>
      <Trans id="interface.common.errorBoundary.theError">The error</Trans>
    </h1>
    <p className="text-muted">
      <Trans id="interface.common.errorBoundary.technicalInformation">
        Technical information to help you fix it. Or us if not you. Technical information to help
        whoever is inclined to fix the issue.
      </Trans>
    </p>
    {eventId && (
      <p className="text-muted">
        <Trans id="interface.common.errorBoundary.eventId">Sentry event ID: {eventId}</Trans>
      </p>
    )}
    <p>{error.message}</p>
    {error.stack && (
      <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        {error.stack.trim()}
      </pre>
    )}
    {componentStack && (
      <pre style={{ color: 'red' }}>
        <Trans id="interface.common.errorBoundary.errorAbove">
          The above error occurred in the component:
        </Trans>
        {componentStack}
      </pre>
    )}
  </div>
);

const ErrorBoundary = ({ children }: { children: ReactNode }) => (
  <SentryErrorBoundary
    beforeCapture={(scope, error, componentStack) => {
      if (error) {
        // maintain previous behavior; this isn't read by anything
        (window.errors = window.errors ?? []).push(error);
      }
    }}
    fallback={(errorData) => <Fallback {...errorData} />}
  >
    {children}
  </SentryErrorBoundary>
);

export default ErrorBoundary;
