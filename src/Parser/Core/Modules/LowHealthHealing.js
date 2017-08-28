import React from 'react';

import Module from 'Parser/Core/Module';

import Tab from 'Main/Tab';
import LowHealthHealingComponent from 'Main/LowHealthHealing';

class LowHealthHealing extends Module {
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
