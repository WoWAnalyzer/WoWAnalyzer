import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';

import AstralPowerTracker from './AstralPowerTracker';
import AstralPowerBreakdown from './AstralPowerBreakdown';

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
          <AstralPowerBreakdown
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
