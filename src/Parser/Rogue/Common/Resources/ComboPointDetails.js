import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import ComboPointTracker from './ComboPointTracker';


class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  

  statistic() {
    const pointsWasted = this.comboPointTracker.wasted;
    const pointsWastedPerMinute = (pointsWasted / this.owner.fightDuration) * 1000 * 60;
    return (
      <StatisticBox
        icon={<Icon icon="ability_rogue_masterofsubtlety" alt="Waisted Combo Points" />}
        value={`${pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Combo Points per minute"
        tooltip={`You waisted a total of ${pointsWasted} combo points. Some waste is expected due to the random nature of some generation abilities.`}
      />
    );
  }


  statisticOrder = STATISTIC_ORDER.CORE(6);

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Tab title="Combo Point usage breakdown">
          <ResourceBreakdown
            tracker={this.comboPointTracker}
            resourceName="Combo Points"
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }
}

export default ComboPointDetails;
