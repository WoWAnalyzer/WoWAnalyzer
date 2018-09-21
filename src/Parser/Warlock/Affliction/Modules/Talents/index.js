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
    absoluteCorruption: AbsoluteCorruption,
    deathbolt: Deathbolt,
    drainSoulSniping: DrainSoulSniping,
    haunt: Haunt,
    siphonLifeUptime: SiphonLifeUptime,
    soulConduit: SoulConduit,
  };

  constructor(...args) {
    super(...args);
    this.active = [
      this.absoluteCorruption.active,
      this.deathbolt.active,
      this.drainSoulSniping.active,
      this.haunt.active,
      this.siphonLifeUptime.active,
      this.soulConduit.active,
    ].includes(true);
  }

  statistic() {
    return (
      <StatisticsListBox title="Talents">
        {this.drainSoulSniping.active && this.drainSoulSniping.subStatistic()}
        {this.deathbolt.active && this.deathbolt.subStatistic()}
        {this.absoluteCorruption.active && this.absoluteCorruption.subStatistic()}
        {this.siphonLifeUptime.active && this.siphonLifeUptime.subStatistic()}
        {this.haunt.active && this.haunt.subStatistic()}
        {this.soulConduit.active && this.soulConduit.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
