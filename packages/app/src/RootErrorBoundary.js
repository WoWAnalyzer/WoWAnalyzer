import React from 'react';
import PropTypes from 'prop-types';
import { Trans, t } from '@lingui/macro';

import FullscreenError from 'interface/FullscreenError';
import ErrorBoundary from 'interface/ErrorBoundary';
import ApiDownBackground from 'interface/images/api-down-background.gif';
import { EventsParseError } from 'interface/report/EventParser';

class RootErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorDetails: null,
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

  handleErrorEvent(event) {
    const { error } = event;
    // XXX Ignore errors that will be processed by componentDidCatch.
    // SEE: https://github.com/facebook/react/issues/10474
    if (error && error.stack && error.stack.includes('invokeGuardedCallbackDev')) {
      return;
    }
    console.log('Caught a global error');
    this.error(error, 'error');
  }
  handleUnhandledrejectionEvent(event) {
    console.log('Caught a global unhandledrejection');
    this.error(event.reason, 'unhandledrejection');
  }

  error(error, details = null) {
    // NOTE: These filters only prevent the error state from being triggered. Sentry automatically logs them regardless.
    // filename may not be set, according to MDN its support is shitty but it doesn't specify how shitty. It works in Chromium
    const isExternalFile = error.filename && !error.filename.includes(window.location.origin);
    if (isExternalFile) {
      return;
    }
    // TODO: We could also check if location.origin is in stack, as the stack trace may only contain it for local files
    if (error && error.message === 'Script error.') {
      // Some errors are triggered by third party scripts, such as browser plug-ins. These errors should generally not affect the application, so we can safely ignore them for our error handling. If a plug-in like Google Translate messes with the DOM and that breaks the app, that triggers a different error so those third party issues are still handled.
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
              id: "interface.rootErrorBoundary.errorDuringAnalysis",
              message: `An error occured during analysis`
            })}
            details={t({
              id: "interface.rootErrorBoundary.errorDuringAnalysisDetails",
              message: `We fucked up and our code broke like the motherfucker that it is. Please let us know on Discord and we will fix it for you.`
            })}
            background="https://media.giphy.com/media/2sdHZ0iBuI45s6fqc9/giphy.gif"
          />
        );
      }

      return (
        <FullscreenError
          error={<Trans id="interface.rootErrorBoundary.errorOccured">An error occured.</Trans>}
          details={<Trans id="interface.rootErrorBoundary.errorOccuredDetails">An unexpected error occured in the app. Please try again.</Trans>}
          background={ApiDownBackground}
          errorDetails={(
            <>
              <p>{this.state.error.message}</p>
              <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                {this.state.error.stack}
              </pre>
              {this.state.errorDetails && (
                <pre style={{ color: 'red' }}>
                  {this.state.errorDetails}
                </pre>
              )}
            </>
          )}
        >
          <div className="text-muted">
            <Trans id="interface.rootErrorBoundary.bug">This is usually caused by a bug, please let us know about the issue on GitHub or Discord so we can fix it.</Trans>
          </div>
        </FullscreenError>
      );
    }
    return (
      <ErrorBoundary>
        {this.props.children}
      </ErrorBoundary>
    );
  }
}

export default RootErrorBoundary;
