import React from 'react';

import FingerprintFilledIcon from 'interface/icons/FingerprintFilled';

import AVAILABLE_CONFIGS from 'parser/AVAILABLE_CONFIGS';

import './SpecListing.css';

import Spec from './Spec';

class SpecListing extends React.PureComponent {
  render() {
    return (
      <section className="spec-listing">
        <header>
          <div className="row">
            <div className="col-md-12">
              <h1 id="Specializations"><FingerprintFilledIcon /> Specializations</h1>
            </div>
          </div>
        </header>

        <main>
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
        </main>
      </section>
    );
  }
}

export default SpecListing;
