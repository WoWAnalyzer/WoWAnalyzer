import React from 'react';
import PropTypes from 'prop-types';

import DocumentTitle from 'Interface/common/DocumentTitle';

import Details from './Details';

class Page extends React.PureComponent {
  static propTypes = {
    contributorId: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  render() {
    const { contributorId, ...others } = this.props;

    return (
      <div className="container">
        <DocumentTitle title={contributorId} />

        <Details
          ownPage
          contributorId={contributorId}
          {...others}
        />
      </div>
    );
  }
}

export default Page;
