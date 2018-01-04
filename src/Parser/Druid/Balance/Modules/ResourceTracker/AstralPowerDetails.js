import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import AstralPowerTracker from './AstralPowerTracker';

class AstralPowerDetails extends Analyzer {
  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };

  tab() {
    return {
      title: 'Astral Power usage',
      url: 'astral-power-usage',
      render: () => (
        <Tab title="Astral Power usage breakdown">
          <ResourceBreakdown
            tracker={this.astralPowerTracker}
            resourceName="Astral Power"
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

}

export default AstralPowerDetails;
