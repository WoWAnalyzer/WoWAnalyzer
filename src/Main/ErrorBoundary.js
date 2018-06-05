import React from 'react';
import PropTypes from 'prop-types';

import { captureException } from 'common/errorLogger';

import FullscreenError from 'Main/FullscreenError';

import ApiDownBackground from './Images/api-down-background.gif';
import ThunderSoundEffect from './Audio/Thunder Sound effect.mp3';

class ErrorBoundary extends React.Component {
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

  componentDidCatch(error, errorInfo) {
    // Raven doesn't do this automatically
    captureException(error, { extra: errorInfo });
    this.error(error, errorInfo.componentStack);
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
          error="A rendering error occured."
          details="An error occured while trying to render (a part of) this page. Please try again."
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
    return this.props.children;
  }
}

export default ErrorBoundary;
