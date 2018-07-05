import React from 'react';

import DocumentTitle from 'Interface/common/DocumentTitle';

import Premium from './index';

class Page extends React.PureComponent {
  render() {
    return (
      <div className="container">
        <DocumentTitle title="Premium" />

        <Premium {...this.props} />
      </div>
    );
  }
}

export default Page;
