import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import VersatilityIcon from 'interface/icons/Versatility';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// yes these are static
const T1_STATS = 312;
const T2_STATS = 416;
const T3_STATS = 728;

class SurgingVitality extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statAmount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCorruptionByName("Surging Vitality");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.SURGING_VITALITY_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.SURGING_VITALITY_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.SURGING_VITALITY_T3.id) * T3_STATS;

    this.statTracker.add(SPELLS.SURGING_VITALITY_BUFF.id, {
      versatility: this.statAmount,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SURGING_VITALITY_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic size="flexible">
        <BoringSpellValueText spell={SPELLS.SURGING_VITALITY_BUFF}>
          <VersatilityIcon /> {formatNumber(this.buffUptime * this.statAmount)} <small>average Versatility</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default SurgingVitality;
