import React from 'react';

import DocumentTitle from 'interface/common/DocumentTitle';
import AVAILABLE_CONFIGS from 'parser/AVAILABLE_CONFIGS';

import './SpecListing.css';

import Spec from './Spec';

class SpecListing extends React.PureComponent {
  render() {
    return (
      <>
        <DocumentTitle title="Specializations" />

        <div>
          <h1>Specializations</h1>
        </div>
        <small>Click any specialization to view an example report for that spec.</small>

        <div className="spec-listing">
          {AVAILABLE_CONFIGS
            .sort((a, b) => {
              if (a.spec.className < b.spec.className) {
                return -1;
              } else if (a.spec.className > b.spec.className) {
                return 1;
              }
              return a.spec.id - b.spec.id;
            })
            .map(config => <Spec key={config.spec.id} {...config} />)}
        </div>
      </>
    );
  }
}

export default SpecListing;
