import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

import { captureException } from 'common/errorLogger';

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
  }

  componentDidCatch(error, errorInfo) {
    // Raven doesn't do this automatically
    captureException(error, { extra: errorInfo });
    this.error(error, errorInfo.componentStack);
  }

  error(error, details = null) {
    (window.errors = window.errors || []).push(error);

    this.setState({
      error: error,
      errorDetails: details,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-danger">
          <h1 style={{ marginTop: 0 }}><Trans id="interface.common.errorBoundary.error">An error occured while trying to render this part of the page.</Trans></h1>
          <p className="text-muted">
            <Trans id="interface.common.errorBoundary.bug">This is usually caused by a bug in our code. If you're handy with computers please consider sending us a Pull Request with a fix on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a>. Otherwise please let us know in an issue on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or leave us a message on <a href="https://wowanalyzer.com/discord">Discord</a> so we can fix it for you.</Trans>
          </p>

          <h1><Trans id="interface.common.errorBoundary.theError">The error</Trans></h1>
          <p className="text-muted"><Trans id="interface.common.errorBoundary.technicalInformation">Technical information to help you fix it. Or us if not you. Technical information to help whoever is inclined to fix the issue.</Trans></p>
          <p>{this.state.error.message}</p>
          {this.state.error.stack && (
            <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              {this.state.error.stack.trim()}
            </pre>
          )}
          {this.state.errorDetails && (
            <pre style={{ color: 'red' }}>
              <Trans id="interface.common.errorBoundary.errorAbove">The above error occurred in the component:</Trans>
              {this.state.errorDetails}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
