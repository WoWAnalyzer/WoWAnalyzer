import React from 'react';

import DocumentTitle from 'interface/DocumentTitle';
import AVAILABLE_CONFIGS from 'parser';
import { Trans } from '@lingui/macro';

import './SpecList.css';

import SpecListItem from '../SpecListItem';

const SpecListing = () => (
  <>
    <DocumentTitle title="Specializations" />

    <div>
      <Trans id="interface.specList.specs" render="h1">Specializations</Trans>
    </div>
    <Trans id="interface.specList.specs.label" render="small">
      Click any specialization to view an example report for that spec.
    </Trans>

    <div className="spec-listing">
      {AVAILABLE_CONFIGS.sort((a, b) => {
        if (a.spec.className < b.spec.className) {
          return -1;
        } else if (a.spec.className > b.spec.className) {
          return 1;
        }
        return a.spec.id - b.spec.id;
      }).map(config => (
        <SpecListItem key={config.spec.id} {...config} />
      ))}
    </div>
  </>
);

export default SpecListing;
