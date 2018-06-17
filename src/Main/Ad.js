import React from 'react';
import PropTypes from 'prop-types';

class Ad extends React.PureComponent {
  static propTypes = {
    format: PropTypes.oneOf([
      'mediumrectangle',
      'largerectangle',
      'leaderboard',
    ]),
  };

  get style() {
    switch (this.props.format) {
      case 'mediumrectangle':
        return { width: 300, height: 250 };
      case 'largerectangle':
        return { width: 336, height: 280 };
      case 'leaderboard':
        return { width: 728, height: 90 };
      default:
        return {};
    }
  }

  render() {
    // Totally lazy implementation
    if (this.props.format === 'leaderboard') {
      return (
        <a href="/premium">
          <img src="/img/728.jpg" alt="Ad" style={this.style} />
        </a>
      );
    }

    return (
      <a href="/premium">
        <img src="/img/patreon6.jpg" alt="Ad" style={this.style} />
      </a>
    );
  }
}

export default Ad;
