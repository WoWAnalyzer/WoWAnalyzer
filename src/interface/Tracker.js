import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { track } from 'common/analytics';

class Tracker extends React.PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
    }).isRequired,
  };

  getPath(location) {
    return `${location.pathname}${location.search}`;
  }
  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      // console.log('Location changed. Old:', prevProps.location, 'new:', this.props.location, document.title);
      track(this.getPath(prevProps.location), this.getPath(this.props.location));
    }
  }

  render() {
    return null;
  }
}

export default withRouter(Tracker);
