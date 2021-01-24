import React from 'react';

import StatisticGroup from 'parser/ui/StatisticGroup';
import Analyzer from 'parser/core/Analyzer';

import DamageDone from './DamageDone';
import HealingDone from './HealingDone';
import DamageTaken from './DamageTaken';

/**
 * @property {DamageDone} damageDone
 * @property {HealingDone} healingDone
 * @property {DamageTaken} damageTaken
 */
class ThroughputStatisticGroup extends Analyzer {
  static dependencies = {
    damageDone: DamageDone,
    healingDone: HealingDone,
    damageTaken: DamageTaken,
  };

  protected damageDone!: DamageDone;
  protected healingDone!: HealingDone;
  protected damageTaken!: DamageTaken;

  statistic() {
    return (
      <StatisticGroup
        position={0}
        wide
        large={false}
        style={{ marginBottom: 30 }}
      >
        {this.damageDone.subStatistic()}
        {this.healingDone.subStatistic()}
        {this.damageTaken.subStatistic()}
      </StatisticGroup>
    );
  }
}

export default ThroughputStatisticGroup;
