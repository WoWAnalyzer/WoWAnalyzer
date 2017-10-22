import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    Raven && Raven.captureException(error, { extra: errorInfo }); // eslint-disable-line no-undef
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h1>Oops.</h1>
          <p>We're sorry — something's gone wrong.</p>
          <p>Our team has been notified. Please note that most crashes can be solved by using a modern browser. See <a href="http://outdatedbrowser.com/">outdatedbrowser.com</a>.</p>
          <p>{this.state.error.message}</p>
          <pre style={{ color: 'red', fontSize: '1.2em' }}>
            {this.state.error.stack}
          </pre>
          <pre style={{ color: 'red', fontSize: '1.2em' }}>
            {this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
