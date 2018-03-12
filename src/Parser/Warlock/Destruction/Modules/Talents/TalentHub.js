import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Backdraft from './Backdraft';
import ChannelDemonfire from './ChannelDemonfire';
import EmpoweredLifeTap from './EmpoweredLifeTap';
import FireAndBrimstone from './FireAndBrimstone';
import ReverseEntropy from './ReverseEntropy';
import RoaringBlaze from './RoaringBlaze';
import Shadowburn from './Shadowburn';
import SoulConduit from './SoulConduit';
import SoulHarvestTalent from './SoulHarvestTalent';

class TalentHub extends Analyzer {
  static dependencies = {
    backdraft: Backdraft,
    shadowburn: Shadowburn,
    roaringBlaze: RoaringBlaze,
    empoweredLifeTap: EmpoweredLifeTap,
    reverseEntropy: ReverseEntropy,
    fireAndBrimstone: FireAndBrimstone,
    soulHarvestTalent: SoulHarvestTalent,
    channelDemonfire: ChannelDemonfire,
    soulConduit: SoulConduit,
  };

  statistic() {
    return (
      <StatisticsListBox title="Talents">
        {this.backdraft.active && this.backdraft.subStatistic()}
        {this.shadowburn.active && this.shadowburn.subStatistic()}
        {this.roaringBlaze.active && this.roaringBlaze.subStatistic()}
        {this.empoweredLifeTap.active && this.empoweredLifeTap.subStatistic()}
        {this.reverseEntropy.active && this.reverseEntropy.subStatistic()}
        {this.fireAndBrimstone.active && this.fireAndBrimstone.subStatistic()}
        {this.soulHarvestTalent.active && this.soulHarvestTalent.subStatistic()}
        {this.channelDemonfire.active && this.channelDemonfire.subStatistic()}
        {this.soulConduit.active && this.soulConduit.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1000);
}

export default TalentHub;
