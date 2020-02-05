import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import MasteryIcon from 'interface/icons/Mastery';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// yes these are static
const T1_STATS: number = 392;
const T2_STATS: number = 523;
const T3_STATS: number = 915;

class HonedMind extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statAmount: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Honed Mind");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.HONED_MIND_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.HONED_MIND_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.HONED_MIND_T3.id) * T3_STATS;

    options.statTracker.add(SPELLS.HONED_MIND_BUFF.id, {
      mastery: this.statAmount,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.HONED_MIND_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.HONED_MIND_BUFF}>
          <MasteryIcon /> {formatNumber(this.buffUptime * this.statAmount)} <small>average Mastery</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HonedMind;
