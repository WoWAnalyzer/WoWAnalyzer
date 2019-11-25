import React from 'react';
import PropTypes from 'prop-types';

const siteName = 'WoWAnalyzer';

class DocumentTitle extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
  };

  render() {
    const { title } = this.props;

    document.title = title ? `${title} - ${siteName}` : siteName;
    // console.log('New document title:', document.title);

    return null;
  }
}

export default DocumentTitle;
