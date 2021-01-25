import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import StatisticBar from 'parser/ui/StatisticBar';

import VampiricTouch from '../spells/VampiricTouch';
import ShadowWordPain from '../spells/ShadowWordPain';
import DevouringPlague from '../spells/DevouringPlague';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    vampiricTouch: VampiricTouch,
    shadowWordPain: ShadowWordPain,
    devouringPlague: DevouringPlague,
  };
  protected vampiricTouch!: VampiricTouch;
  protected shadowWordPain!: ShadowWordPain;
  protected devouringPlague!: DevouringPlague;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.vampiricTouch.subStatistic()}
        {this.shadowWordPain.subStatistic()}
        {this.devouringPlague.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
