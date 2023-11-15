import { Trans, t } from '@lingui/macro';
import ErrorBoundary from 'interface/ErrorBoundary';
import FullscreenError from 'interface/FullscreenError';
import ApiDownBackground from 'interface/images/api-down-background.gif';
import PropTypes from 'prop-types';
import React, { ErrorInfo, ReactNode } from 'react';

import { EventsParseError } from './report/hooks/useEventParser';

interface HandledError {
  message: string;
  stack?: string;
  filename?: string;
}

type ErrorItem = Error | undefined;

// Some errors are triggered by third party scripts, such as browser plug-ins.
// These errors should generally not affect the application, so we can safely ignore them for
// our error handling. If a plug-in like Google Translate messes with the DOM and that breaks the
// app, that triggers a different error so those third party issues are still handled.
const isTriggeredByExternalScript = (error: HandledError) => {
  if (!error || error.message === 'Script error.') {
    return true;
  }

  // The stack trace includes links to each script involved in the error. Find
  // the first relevant link and check if it was one of our scripts.
  if (!error.stack) {
    return true;
  }
  const paths = error.stack
    .split('\n')
    // The first line may point to the page the error occurred on rather than
    // the script that caused it, so ignore that to avoid false positives.
    .splice(1)
    .map((line) => line.match(/(https?:\/\/[^/]+)\//))
    .filter((line) => line);
  const firstPath = paths[0];
  if (!firstPath) {
    return true;
  }
  if (firstPath[1] !== window.location.origin) {
    return true;
  }

  return false;
};

interface Props {
  children: ReactNode;
}
interface State {
  error?: Error;
  errorDetails?: string;
}

class RootErrorBoundary extends React.PureComponent<Props, State> {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      error: undefined,
      errorDetails: undefined,
    };

    this.handleErrorEvent = this.handleErrorEvent.bind(this);
    this.handleUnhandledrejectionEvent = this.handleUnhandledrejectionEvent.bind(this);

    window.addEventListener('error', this.handleErrorEvent);
    window.addEventListener('unhandledrejection', this.handleUnhandledrejectionEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleErrorEvent);
    window.removeEventListener('unhandledrejection', this.handleUnhandledrejectionEvent);
  }

  componentDidCatch(error: Error, { componentStack }: ErrorInfo) {
    // we don't call captureException here because it will be called by the child ErrorBoundary
    // this boundary exists primarily for dev mode.
    this.error(error, componentStack);
  }

  handleErrorEvent(event: ErrorEvent) {
    const { error } = event;
    // XXX Ignore errors that will be processed by componentDidCatch.
    // SEE: https://github.com/facebook/react/issues/10474
    if (error && error.stack && error.stack.includes('invokeGuardedCallbackDev')) {
      return;
    }
    console.log('Caught a global error');
    this.error(error, 'error');
  }
  handleUnhandledrejectionEvent(event: PromiseRejectionEvent) {
    console.log('Caught a global unhandledrejection');
    this.error(event.reason, 'unhandledrejection');
  }

  error(error: ErrorItem, details?: string) {
    if (!error) {
      return;
    }
    // NOTE: These filters only prevent the error state from being triggered. Sentry automatically logs them regardless.
    if (isTriggeredByExternalScript(error)) {
      console.log('Ignored because it looks like a third party error.');
      return;
    }

    (window.errors = window.errors || []).push(error);

    this.setState({
      error: error,
      errorDetails: details,
    });
  }

  render() {
    if (this.state.error) {
      if (this.state.error instanceof EventsParseError) {
        return (
          <FullscreenError
            error={t({
              id: 'interface.rootErrorBoundary.errorDuringAnalysis',
              message: `An error occurred during analysis`,
            })}
            details={t({
              id: 'interface.rootErrorBoundary.errorDuringAnalysisDetails',
              message: `We ran into an error while looking at your gameplay and running our analysis. Please let us know on Discord and we will fix it for you.`,
            })}
            background="https://media.giphy.com/media/2sdHZ0iBuI45s6fqc9/giphy.gif"
          />
        );
      }

      // TODO: Instead of hiding the entire app, show a small toaster instead. Not all uncaught errors are fatal.
      return (
        <FullscreenError
          error={<Trans id="interface.rootErrorBoundary.errorOccurred">An error occurred.</Trans>}
          details={
            <Trans id="interface.rootErrorBoundary.errorOccurredDetails">
              An unexpected error occurred in the app. Please try again.
            </Trans>
          }
          background={ApiDownBackground}
          errorDetails={
            <>
              <p>{this.state.error.message}</p>
              <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                {this.state.error.stack}
              </pre>
              {this.state.errorDetails && (
                <pre style={{ color: 'red' }}>{this.state.errorDetails}</pre>
              )}
            </>
          }
        >
          <div className="text-muted">
            <Trans id="interface.rootErrorBoundary.bug">
              This is usually caused by a bug, please let us know about the issue on GitHub or
              Discord so we can fix it.
            </Trans>
          </div>
        </FullscreenError>
      );
    }
    return <ErrorBoundary>{this.props.children}</ErrorBoundary>;
  }
}

export default RootErrorBoundary;
