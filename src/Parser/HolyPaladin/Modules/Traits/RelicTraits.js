import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Module from 'Parser/Core/Module';

import DeliverTheLight from './DeliverTheLight';
import ExpelTheDarkness from './ExpelTheDarkness';
import SecondSunrise from './SecondSunrise';
import ShockTreatment from './ShockTreatment';
import TyrsMunificence from './TyrsMunificence';
import JusticeThroughSacrifice from './JusticeThroughSacrifice';

class RelicTraits extends Module {
  static dependencies = {
    deliverTheLight: DeliverTheLight,
    expelTheDarkness: ExpelTheDarkness,
    secondSunrise: SecondSunrise,
    shockTreatment: ShockTreatment,
    tyrsMunificence: TyrsMunificence,
    justiceThroughSacrifice: JusticeThroughSacrifice,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight. The value of an additional point would likely be slightly lower due to increased overhealing."
        style={{ minHeight: 186 }}
      >
        {this.shockTreatment.subStatistic()}
        {this.deliverTheLight.subStatistic()}
        {this.secondSunrise.subStatistic()}
        {this.expelTheDarkness.subStatistic()}
        {this.tyrsMunificence.subStatistic()}
        {this.justiceThroughSacrifice.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;
