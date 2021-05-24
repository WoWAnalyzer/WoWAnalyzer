import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import React from 'react';
import Lifebloom from './Lifebloom';
import Efflorescence from './Efflorescence';

class LifebloomAndEffloUptime extends Analyzer {
  static dependencies = {
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
  };
  protected lifebloom!: Lifebloom;
  protected efflorescence!: Efflorescence;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.lifebloom.subStatistic()}
        {this.efflorescence.subStatistic()}
      </StatisticBar>
    );
  }
}
