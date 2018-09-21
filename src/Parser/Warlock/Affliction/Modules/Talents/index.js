import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticsListBox from 'Interface/Others/StatisticsListBox';

import AbsoluteCorruption from './AbsoluteCorruption';
import Deathbolt from './Deathbolt';
import DrainSoulSniping from './DrainSoulSniping';
import Haunt from './Haunt';
import SiphonLifeUptime from './SiphonLifeUptime';
import SoulConduit from './SoulConduit';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    drainSoulSniping: DrainSoulSniping,
    deathbolt: Deathbolt,
    absoluteCorruption: AbsoluteCorruption,
    siphonLifeUptime: SiphonLifeUptime,
    haunt: Haunt,
    soulConduit: SoulConduit,
  };

  constructor(...args) {
    super(...args);
    this.active = Object.keys(this.constructor.dependencies)
      .map(name => this[name].active)
      .includes(true);
  }

  statistic() {
    return (
      <StatisticsListBox title="Talents">
        {
          Object.keys(this.constructor.dependencies)
            .map(name => this[name])
            .filter(module => module.active)
            .map(module => module.subStatistic())
        }
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
