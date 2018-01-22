import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import FuryTracker from './FuryTracker';

class AstralPowerDetails extends Analyzer {
  static dependencies = {
    furyTracker: FuryTracker,
  };

  tab() {
    return {
      title: 'Fury usage',
      url: 'fury-usage',
      render: () => (
        <Tab title="Fury usage breakdown">
          <ResourceBreakdown
            tracker={this.furyTracker}
            resourceName="Fury"
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

}

export default AstralPowerDetails;
