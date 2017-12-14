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
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Talents"
      >
        {this.backdraft.subStatistic()}
        {this.eradication.subStatistic()}
        {this.empoweredLifeTap.subStatistic()}
        {this.channelDemonfire.subStatistic()}        
        {this.soulHarvestTalent.subStatistic()}
        {this.fnb.subStatistic()}
        {this.entropy.subStatistic()}
        {this.roaringBlaze.subStatistic()}
        {this.shadowburn.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1000);
}

export default TalentHub;
