import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

// Source: https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/scroll-restoration.md
class RouteChangeScroller extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
  };

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return null;
  }
}

export default withRouter(RouteChangeScroller);
