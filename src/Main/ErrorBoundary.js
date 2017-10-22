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
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
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
          <pre style={{ color: 'red'}}>
            {this.state.error.message}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
