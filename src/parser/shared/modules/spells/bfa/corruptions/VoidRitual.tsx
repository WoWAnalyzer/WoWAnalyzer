import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import CriticalIcon from 'interface/icons/CriticalStrike';
import HasteIcon from 'interface/icons/Haste';
import VersatilityIcon from 'interface/icons/Versatility';
import MasteryIcon from 'interface/icons/Mastery';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

// yes these are static
const T1_STATS: number = 14;
const T2_STATS: number = 33;
const T3_STATS: number = 63;

class VoidRitual extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  statAmount: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Void Ritual");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.VOID_RITUAL_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.VOID_RITUAL_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.VOID_RITUAL_T3.id) * T3_STATS;

    options.statTracker.add(SPELLS.VOID_RITUAL_BUFF.id, {
      versatility: this.statAmount,
      mastery: this.statAmount,
      haste: this.statAmount,
      crit: this.statAmount,
    });
  }

  get weightedBuffUptime() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.VOID_RITUAL_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.VOID_RITUAL_BUFF}>
          <CriticalIcon /> {formatNumber(this.weightedBuffUptime * this.statAmount)} <small>average Crit</small><br />
          <HasteIcon /> {formatNumber(this.weightedBuffUptime * this.statAmount)} <small>average Haste</small><br />
          <MasteryIcon /> {formatNumber(this.weightedBuffUptime * this.statAmount)} <small>average Mastery</small><br />
          <VersatilityIcon /> {formatNumber(this.weightedBuffUptime * this.statAmount)} <small>average Versatility</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidRitual;
