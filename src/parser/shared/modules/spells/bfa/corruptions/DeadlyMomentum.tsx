import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import CriticalIcon from 'interface/icons/CriticalStrike';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// yes these are static
const T1_STATS: number = 31;
const T2_STATS: number = 41;
const T3_STATS: number = 72;

class DeadlyMomentum extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statAmount: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Deadly Momentum");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.DEADLY_MOMENTUM_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.DEADLY_MOMENTUM_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.DEADLY_MOMENTUM_T3.id) * T3_STATS;

    options.statTracker.add(SPELLS.DEADLY_MOMENTUM_BUFF.id, {
      crit: this.statAmount,
    });
  }

  get weightedBuffUptime() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.DEADLY_MOMENTUM_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.DEADLY_MOMENTUM_BUFF}>
          <CriticalIcon /> {formatNumber(this.weightedBuffUptime * this.statAmount)} <small>average Crit</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeadlyMomentum;
