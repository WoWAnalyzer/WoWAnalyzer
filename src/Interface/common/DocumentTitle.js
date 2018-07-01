import React from 'react';
import PropTypes from 'prop-types';

const siteName = 'WoWAnalyzer';

class DocumentTitle extends React.PureComponent {
  static propTypes = {
    children: PropTypes.string,
  };

  render() {
    const { children } = this.props;

    document.title = children ? `${children} - ${siteName}` : siteName;

    return null;
  }
}

export default DocumentTitle;
