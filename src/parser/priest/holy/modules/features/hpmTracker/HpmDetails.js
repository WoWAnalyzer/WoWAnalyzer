import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import HpmTracker from 'parser/priest/holy/modules/features/hpmTracker/HpmTracker';
import HpmBreakdown from './HpmBreakdown';

class HpmDetails extends Analyzer {
  static dependencies = {
    hpmTracker: HpmTracker,
  };

  tab() {
    return {
      title: 'Mana Usage',
      url: 'mana-usage',
      render: () => (
        <Tab>
          <HpmBreakdown
            tracker={this.hpmTracker}
            showSpenders
          />
        </Tab>
      ),
    };
  }
}

export default HpmDetails;
