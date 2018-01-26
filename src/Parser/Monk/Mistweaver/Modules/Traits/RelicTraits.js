import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

// TODO:
// Improve Extended Healing Relic Module

import CoalescingMists from './CoalescingMists';
import SoothingRemedies from './SoothingRemedies';
import EssenceOfTheMist from './EssenceOfTheMist';
import WayOfTheMistweaver from './WayOfTheMistweaver';
import InfusionOfLife from './InfusionOfLife';
import ProtectionOfShaohao from './ProtectionOfShaohao';
import ExtendedHealing from './ExtendedHealing';

class RelicTraits extends Analyzer {
  static dependencies = {
    coalescingMists: CoalescingMists,
    soothingRemedies: SoothingRemedies,
    essenceOfTheMist: EssenceOfTheMist,
    wayOfTheMistweaver: WayOfTheMistweaver,
    infusionOfLife: InfusionOfLife,
    protectionOfShaohao: ProtectionOfShaohao,
    extendedHealing: ExtendedHealing,
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
        {this.extendedHealing.subStatistic()}
        {this.wayOfTheMistweaver.subStatistic()}
        {this.soothingRemedies.subStatistic()}
        {this.protectionOfShaohao.subStatistic()}
        {this.coalescingMists.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(60);
}

export default RelicTraits;
