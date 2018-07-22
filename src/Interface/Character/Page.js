import React from 'react';
import PropTypes from 'prop-types';

import DocumentTitle from 'Interface/common/DocumentTitle';

import Parses from './Parses';

class Page extends React.PureComponent {
  static propTypes = {
    region: PropTypes.string.isRequired,
    realm: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  render() {
    const { region, realm, name, ...others } = this.props;

    return (
      <div className="container">
        <DocumentTitle title={`${name}-${realm} (${region})`} />

        <Parses
          region={region}
          realm={realm}
          name={name}
          {...others}
        />
      </div>
    );
  }
}

export default Page;
