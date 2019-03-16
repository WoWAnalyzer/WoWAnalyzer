import React from 'react';

import DocumentTitle from 'interface/common/DocumentTitle';

import Premium from './index';

class Page extends React.PureComponent {
  render() {
    return (
      <>
        <DocumentTitle title="Premium" />

        <Premium {...this.props} />
      </>
    );
  }
}

export default Page;
