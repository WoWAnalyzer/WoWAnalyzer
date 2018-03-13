import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

import Bonebreaker from './Bonebreaker';
import AllConsumingRot from './AllConsumingRot';
import Veinrender from './Veinrender';
import Coagulopathy from './Coagulopathy';

class RelicTraits extends Analyzer {
  static dependencies = {
    bonebreaker: Bonebreaker,
    allConsumingRot: AllConsumingRot,
    veinrender: Veinrender,
    coagulopathy: Coagulopathy,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight."
        style={{ minHeight: 186 }}
      >
        {this.bonebreaker.subStatistic()}
        {this.allConsumingRot.subStatistic()}
        {this.veinrender.subStatistic()}
        {this.coagulopathy.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;
