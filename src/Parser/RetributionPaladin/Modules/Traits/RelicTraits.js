import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Module from 'Parser/Core/Module';

import MightOfTheTemplar from './MightOfTheTemplar';
import HighlordsJudgment from './HighlordsJudgment';
import DeliverTheJustice from './DeliverTheJustice';
import RighteousVerdict from './RighteousVerdict';
import SharpenedEdge from './SharpenedEdge';

class RelicTraits extends Module {
  static dependencies = {
    mightOfTheTemplar: MightOfTheTemplar,
    highlordsJudgment: HighlordsJudgment,
    deliverTheJustice: DeliverTheJustice,
    righteousVerdict: RighteousVerdict,
    sharpenedEdge: SharpenedEdge,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight. The value of an additional point would likely be slightly lower due to increased overhealing."
        style={{ minHeight: 186 }}
      >
        {this.mightOfTheTemplar.subStatistic()}
        {this.highlordsJudgment.subStatistic()}
        {this.deliverTheJustice.subStatistic()}
        {this.righteousVerdict.subStatistic()}
        {this.sharpenedEdge.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;
