import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Module from 'Parser/Core/Module';

// TODO: Traits to add:
//        Extended Healing - 1sec on Renewing Mist

import CoalescingMists from './CoalescingMists';
import SoothingRemedies from './SoothingRemedies';
import EssenceOfTheMist from './EssenceOfTheMist';
import WayOfTheMistweaver from './WayOfTheMistweaver';
import InfusionOfLife from './InfusionOfLife';
import ProtectionOfShaohao from './ProtectionOfShaohao';

class RelicTraits extends Module {
  static dependencies = {
    coalescingMists: CoalescingMists,
    soothingRemedies: SoothingRemedies,
    essenceOfTheMist: EssenceOfTheMist,
    wayOfTheMistweaver: WayOfTheMistweaver,
    infusionOfLife: InfusionOfLife,
    protectionOfShaohao: ProtectionOfShaohao,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight. The value of an additional point would likely be slightly lower due to increased overhealing."
        style={{ minHeight: 186 }}
      >
        {this.essenceOfTheMist.subStatistic()}
        {this.infusionOfLife.subStatistic()}
        {this.coalescingMists.subStatistic()}
        {this.soothingRemedies.subStatistic()}
        {this.wayOfTheMistweaver.subStatistic()}
        {this.protectionOfShaohao.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;
