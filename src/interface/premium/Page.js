import React from 'react';

import DocumentTitle from 'interface/common/DocumentTitle';

import Premium from './index';

class Page extends React.PureComponent {
  render() {
    return (
      <div className="container" style={{ marginTop: 100 }}>
        <DocumentTitle title="Premium" />

        <Premium {...this.props} />
      </div>
    );
  }
}

export default Page;
