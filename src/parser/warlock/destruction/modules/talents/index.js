import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import StatisticsListBox from 'interface/others/StatisticsListBox';

import ReverseEntropy from './ReverseEntropy';
import ChannelDemonfire from './ChannelDemonfire';
// import FireAndBrimstone from './FireAndBrimstone';
import SoulConduit from './SoulConduit';
import GrimoireOfSupremacy from './GrimoireOfSupremacy';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    reverseEntropy: ReverseEntropy,
    // fireAndBrimstone: FireAndBrimstone,
    channelDemonfire: ChannelDemonfire,
    soulConduit: SoulConduit,
    grimoireOfSupremacy: GrimoireOfSupremacy,
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
