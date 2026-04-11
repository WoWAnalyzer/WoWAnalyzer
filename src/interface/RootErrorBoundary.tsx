import { Trans } from '@lingui/react/macro';
import { defineMessage } from '@lingui/core/macro';
import ErrorBoundary from 'interface/ErrorBoundary';
import FullscreenError from 'interface/FullscreenError';
import ApiDownBackground from 'interface/images/api-down-background.gif';
import { PureComponent, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

import { classifyUiError, type ClassifiedUiError, type ErrorSource } from './errorHandling';
import { EventsParseError } from './report/hooks/useEventParser';

const NON_FATAL_ERROR_TOAST_DURATION = 10000;
const NON_FATAL_ERROR_TOAST_DEDUPE_MS = 10000;

interface Props {
  children: ReactNode;
}
interface State {
  error?: Error;
  errorDetails?: string | null;
}

class RootErrorBoundary extends PureComponent<Props, State> {
  private recentNonFatalToasts = new Map<string, number>();

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
    this.handleCaughtError(error, componentStack, 'componentDidCatch');
  }

  handleErrorEvent(event: ErrorEvent) {
    const { error } = event;
    // XXX Ignore errors that will be processed by componentDidCatch.
    // SEE: https://github.com/facebook/react/issues/10474
    if (error && error.stack && error.stack.includes('invokeGuardedCallbackDev')) {
      return;
    }
    console.log('Caught a global error');
    this.handleCaughtError(error, 'error', 'window-error');
  }
  handleUnhandledrejectionEvent(event: PromiseRejectionEvent) {
    console.log('Caught a global unhandledrejection');
    this.handleCaughtError(event.reason, 'unhandledrejection', 'unhandledrejection');
  }

  private shouldSkipNonFatalToast(classifiedError: ClassifiedUiError) {
    const now = Date.now();
    const lastShown = this.recentNonFatalToasts.get(classifiedError.fingerprint);

    for (const [fingerprint, timestamp] of this.recentNonFatalToasts.entries()) {
      if (now - timestamp >= NON_FATAL_ERROR_TOAST_DEDUPE_MS) {
        this.recentNonFatalToasts.delete(fingerprint);
      }
    }

    if (lastShown && now - lastShown < NON_FATAL_ERROR_TOAST_DEDUPE_MS) {
      return true;
    }

    this.recentNonFatalToasts.set(classifiedError.fingerprint, now);
    return false;
  }

  private showNonFatalErrorToast(classifiedError: ClassifiedUiError) {
    if (this.shouldSkipNonFatalToast(classifiedError)) {
      return;
    }

    if (import.meta.env.DEV) {
      console.error('Caught a recoverable global error', classifiedError.error);
    }

    toast.error(
      <Trans id="interface.rootErrorBoundary.nonFatalErrorTitle">
        Something went wrong, but the page can keep working.
      </Trans>,
      {
        description: classifiedError.message,
        duration: NON_FATAL_ERROR_TOAST_DURATION,
        action: {
          label: 'Reload',
          onClick: () => window.location.reload(),
        },
      },
    );
  }

  private handleCaughtError(
    error: unknown,
    details?: string | null,
    source: ErrorSource = 'window-error',
  ) {
    const classifiedError = classifyUiError(error, source);
    if (!classifiedError) {
      console.log('Ignored because it looks like a third party error.');
      return;
    }

    (window.errors = window.errors || []).push(classifiedError.error);

    if (classifiedError.severity === 'nonFatal') {
      this.showNonFatalErrorToast(classifiedError);
      return;
    }

    this.setState({
      error: classifiedError.error,
      errorDetails: details,
    });
  }

  render() {
    if (this.state.error) {
      if (this.state.error instanceof EventsParseError) {
        return (
          <FullscreenError
            error={defineMessage({
              id: 'interface.rootErrorBoundary.errorDuringAnalysis',
              message: `An error occurred during analysis`,
            })}
            details={defineMessage({
              id: 'interface.rootErrorBoundary.errorDuringAnalysisDetails',
              message: `We ran into an error while looking at your gameplay and running our analysis. Please let us know on Discord and we will fix it for you.`,
            })}
            background="https://media.giphy.com/media/2sdHZ0iBuI45s6fqc9/giphy.gif"
          />
        );
      }

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
