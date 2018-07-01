import React from 'react';
import PropTypes from 'prop-types';

class DocumentTitle extends React.PureComponent {
  static propTypes = {
    children: PropTypes.string,
  };

  render() {
    const { children } = this.props;

    document.title = `${children} - WoWAnalyzer`;
    return null;
  }
}

export default DocumentTitle;
