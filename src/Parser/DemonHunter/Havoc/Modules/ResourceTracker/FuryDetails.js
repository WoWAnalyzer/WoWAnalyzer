import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import FuryTracker from './FuryTracker';

class FuryDetails extends Analyzer {
  static dependencies = {
    furyTracker: FuryTracker,
  };

  tab() {
    return {
      title: 'Fury Usage',
      url: 'fury-usage',
      render: () => (
        <Tab title="Fury usage breakdown">
          <ResourceBreakdown
            tracker={this.furyTracker}
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

}

export default FuryDetails;
