import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

//credit to hpal mod, i modified the traits script
import Backdraft from './Backdraft';
import ChannelDemonfire from './ChannelDemonfire';
import Eradication from './Eradication';
import EmpoweredLifeTap from './EmpoweredLifeTap';
import FireAndBrimstone from './FireAndBrimstone';
import ReverseEntropy from './ReverseEntropy';
import RoaringBlaze from './RoaringBlaze';
import Shadowburn from './Shadowburn';
import SoulHarvestTalent from './SoulHarvestTalent';

class TalentHub extends Analyzer {
  static dependencies = {
    backdraft: Backdraft,
    shadowburn: Shadowburn,
    roaringBlaze: RoaringBlaze,
    eradication: Eradication,
    empoweredLifeTap: EmpoweredLifeTap,
    reverseEntropy: ReverseEntropy,
    fireAndBrimstone: FireAndBrimstone,
    soulHarvestTalent: SoulHarvestTalent,
    channelDemonfire: ChannelDemonfire,
  };

  statistic() {
    return (
      <StatisticsListBox title="Talents">
        {this.backdraft.active && this.backdraft.subStatistic()}
        {this.shadowburn.active && this.shadowburn.subStatistic()}
        {this.roaringBlaze.active && this.roaringBlaze.subStatistic()}
        {this.eradication.active && this.eradication.subStatistic()}
        {this.empoweredLifeTap.active && this.empoweredLifeTap.subStatistic()}
        {this.reverseEntropy.active && this.reverseEntropy.subStatistic()}
        {this.fireAndBrimstone.active && this.fireAndBrimstone.subStatistic()}
        {this.soulHarvestTalent.active && this.soulHarvestTalent.subStatistic()}
        {this.channelDemonfire.active && this.channelDemonfire.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1000);
}

export default TalentHub;
