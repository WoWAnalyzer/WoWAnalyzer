import React from 'react';
import PropTypes from 'prop-types';

class Article extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { children } = this.props;

    return children;
  }
}

export default Article;
