import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import ChannelDemonfire from './ChannelDemonfire';
import FireAndBrimstone from './FireAndBrimstone';
import Shadowburn from './Shadowburn';
import SoulConduit from './SoulConduit';

class TalentHub extends Analyzer {
  static dependencies = {
    shadowburn: Shadowburn,
    fireAndBrimstone: FireAndBrimstone,
    channelDemonfire: ChannelDemonfire,
    soulConduit: SoulConduit,
  };

  on_initialized() {
    this.active = this.shadowburn.active || this.fireAndBrimstone.active || this.channelDemonfire.active || this.soulConduit.active;
  }

  statistic() {
    return (
      <StatisticsListBox title="Talents">
        {this.shadowburn.active && this.shadowburn.subStatistic()}
        {this.fireAndBrimstone.active && this.fireAndBrimstone.subStatistic()}
        {this.channelDemonfire.active && this.channelDemonfire.subStatistic()}
        {this.soulConduit.active && this.soulConduit.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1000);
}

export default TalentHub;
