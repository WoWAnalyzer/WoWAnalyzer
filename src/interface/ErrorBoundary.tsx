import React, { ErrorInfo } from 'react';
import { Trans } from '@lingui/macro';

import { captureException } from 'common/errorLogger';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error|null;
  componentStack: string|null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
    componentStack: null,
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Raven doesn't do this automatically
    const { componentStack } = errorInfo;
    const extra = { componentStack };
    captureException(error, { extra });
    ((window as any).errors = (window as any).errors || []).push(error);

    this.setState({
      error: error,
      componentStack,
    });
  }

  render() {
    if (this.state.error === null) {
      return this.props.children;
    }

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
        {this.state.componentStack && (
          <pre style={{ color: 'red' }}>
            <Trans id="interface.common.errorBoundary.errorAbove">The above error occurred in the component:</Trans>
            {this.state.componentStack}
          </pre>
        )}
      </div>
    )
  }
}

export default ErrorBoundary;
