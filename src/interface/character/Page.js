import React from 'react';
import PropTypes from 'prop-types';

import DocumentTitle from 'interface/common/DocumentTitle';
import NavigationBar from 'interface/layout/NavigationBar';

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
      <>
        <DocumentTitle title={`${name}-${realm} (${region})`} />

        <NavigationBar />

        <Parses
          region={region}
          realm={realm}
          name={name}
          {...others}
        />
      </>
    );
  }
}

export default Page;
