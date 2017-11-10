import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

import MightOfTheTemplar from './MightOfTheTemplar';
import HighlordsJudgment from './HighlordsJudgment';
import DeliverTheJustice from './DeliverTheJustice';
import RighteousVerdict from './RighteousVerdict';
import WrathOfTheAshbringer from './WrathOfTheAshbringer';

class RelicTraits extends Analyzer {
  static dependencies = {
    mightOfTheTemplar: MightOfTheTemplar,
    highlordsJudgment: HighlordsJudgment,
    deliverTheJustice: DeliverTheJustice,
    righteousVerdict: RighteousVerdict,
    wrathOfTheAshbringer: WrathOfTheAshbringer,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight."
        style={{ minHeight: 186 }}
      >
        {this.wrathOfTheAshbringer.subStatistic()}
        {this.mightOfTheTemplar.subStatistic()}
        {this.highlordsJudgment.subStatistic()}
        {this.deliverTheJustice.subStatistic()}
        {this.righteousVerdict.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;
