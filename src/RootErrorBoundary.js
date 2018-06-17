import React from 'react';
import PropTypes from 'prop-types';

import FullscreenError from 'Main/FullscreenError';
import ErrorBoundary from 'Main/ErrorBoundary';
import ApiDownBackground from 'Main/Images/api-down-background.gif';

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
    this.error(event);
  }
  handleUnhandledrejectionEvent(event) {
    this.error(event.reason);
  }

  error(error, details = null) {
    window.lastError = error;

    this.setState({
      error: error,
      errorDetails: details,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <FullscreenError
          error="An error occured."
          details="An unexpected error occured in the app. Please try again."
          background={ApiDownBackground}
          errorDetails={(
            <React.Fragment>
              <p>{this.state.error.message}</p>
              <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                {this.state.error.stack}
              </pre>
              {this.state.errorDetails && (
                <pre style={{ color: 'red' }}>
                  {this.state.errorDetails}
                </pre>
              )}
            </React.Fragment>
          )}
        >
          <div className="text-muted">
            This is usually caused by a bug, please let us know about the issue on GitHub or Discord so we can fix it.
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
