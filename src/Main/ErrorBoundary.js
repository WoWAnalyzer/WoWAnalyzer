import React from 'react';
import PropTypes from 'prop-types';

import AppBackgroundImage from 'Main/AppBackgroundImage';
import SomethingsGoneWrongBackground from 'Main/Images/somethings-gone-wrong.gif';

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
    window.Raven && window.Raven.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <AppBackgroundImage override={SomethingsGoneWrongBackground} />

          <div className="container">
            <h1>We're sorry — something's gone wrong.</h1>
            <p>Our team has been notified. Please note that most crashes can be solved by using a modern browser. See <a href="http://outdatedbrowser.com/">outdatedbrowser.com</a>.</p>
            <p>{this.state.error.message}</p>
            <pre style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              {this.state.error.stack}
            </pre>
            <pre style={{ color: 'red' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
