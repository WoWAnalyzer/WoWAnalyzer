import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Module from 'Parser/Core/Module';

import DeliverTheLight from './DeliverTheLight';
import ExpelTheDarkness from './ExpelTheDarkness';
import SecondSunrise from './SecondSunrise';
import ShockTreatment from './ShockTreatment';

class RelicTraits extends Module {
  static dependencies = {
    deliverTheLight: DeliverTheLight,
    expelTheDarkness: ExpelTheDarkness,
    secondSunrise: SecondSunrise,
    shockTreatment: ShockTreatment,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Traits"
        tooltip="This only calculates the value of the last point of each trait; for you with your gear and only during this fight. The value of an additional point would likely be slightly lower due to increased overhealing."
      >
        {this.shockTreatment.subStatistic()}
        {this.deliverTheLight.subStatistic()}
        {this.secondSunrise.subStatistic()}
        {this.expelTheDarkness.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.TRAITS(0);
}

export default RelicTraits;
