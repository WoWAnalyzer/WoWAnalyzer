import React from 'react';

import resourceSuggest from 'Parser/Core/Modules/ResourceTracker/ResourceSuggest';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

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

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default AstralPowerDetails;
