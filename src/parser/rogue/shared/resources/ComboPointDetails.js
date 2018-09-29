import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Icon from 'common/Icon';
import ResourceBreakdown from 'parser/core/modules/ResourceTracker/ResourceBreakdown';

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
        tooltip={`You wasted a total of ${pointsWasted} combo points. Some waste is expected due to the random nature of some generation abilities.`}
      />
    );
  }


  statisticOrder = STATISTIC_ORDER.CORE(6);

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.comboPointTracker}
            showSpenders
          />
        </Tab>
      ),
    };
 }
}

export default ComboPointDetails;
