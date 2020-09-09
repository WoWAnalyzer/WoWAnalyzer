import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import VersatilityIcon from 'interface/icons/Versatility';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// yes these are static
const T1_STATS: number = 343;
const T2_STATS: number = 458;
const T3_STATS: number = 801;

class SurgingVitality extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statAmount: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Surging Vitality");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.SURGING_VITALITY_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.SURGING_VITALITY_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.SURGING_VITALITY_T3.id) * T3_STATS;

    options.statTracker.add(SPELLS.SURGING_VITALITY_BUFF.id, {
      versatility: this.statAmount,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SURGING_VITALITY_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.SURGING_VITALITY_BUFF}>
          <VersatilityIcon /> {formatNumber(this.buffUptime * this.statAmount)} <small>average Versatility</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgingVitality;
