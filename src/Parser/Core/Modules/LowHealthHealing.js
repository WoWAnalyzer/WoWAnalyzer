import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import Tab from 'Main/Tab';
import LowHealthHealingComponent from 'Main/LowHealthHealing';

class LowHealthHealing extends Analyzer {
  tab() {
    return {
      title: 'Low health healing',
      url: 'low-health-healing',
      render: () => (
        <Tab title="Low health healing">
          <LowHealthHealingComponent parser={this.owner} />
        </Tab>
      ),
    };
  }
}

export default LowHealthHealing;
