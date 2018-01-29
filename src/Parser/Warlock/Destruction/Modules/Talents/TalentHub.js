import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

//credit to hpal mod, i modified the traits script
import Backdraft from './Backdraft';
import SoulHarvestTalent from './SoulHarvestTalent';
import ChannelDemonfire from './ChannelDemonfire';
import Eradication from './Eradication';
import EmpoweredLifeTap from './EmpoweredLifeTap';
import FireAndBrimstone from './FireAndBrimstone';
import ReverseEntropy from './ReverseEntropy';
import RoaringBlaze from './RoaringBlaze';
import Shadowburn from './Shadowburn';
import SoulConduit from './SoulConduit';

class TalentHub extends Analyzer {
  static dependencies = {
    backdraft: Backdraft,
    soulHarvestTalent: SoulHarvestTalent,
    eradication: Eradication,
    empoweredLifeTap: EmpoweredLifeTap,
    channelDemonfire: ChannelDemonfire,
    fnb: FireAndBrimstone,
    entropy: ReverseEntropy,
    roaringBlaze: RoaringBlaze,
    shadowburn: Shadowburn,
    soulConduit: SoulConduit,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Talents"
      >
        {this.backdraft.active && this.backdraft.subStatistic()}
        {this.soulConduit.active && this.soulConduit.subStatistic()}
        {this.eradication.active && this.eradication.subStatistic()}
        {this.empoweredLifeTap.active && this.empoweredLifeTap.subStatistic()}
        {this.channelDemonfire.active && this.channelDemonfire.subStatistic()}        
        {this.soulHarvestTalent.active && this.soulHarvestTalent.subStatistic()}
        {this.fnb.active && this.fnb.subStatistic()}
        {this.entropy.active && this.entropy.subStatistic()}
        {this.roaringBlaze.active && this.roaringBlaze.subStatistic()}
        {this.shadowburn.active && this.shadowburn.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1000);
}

export default TalentHub;
