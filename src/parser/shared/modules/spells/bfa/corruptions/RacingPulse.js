import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import HasteIcon from 'interface/icons/Haste';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// yes these are static
const T1_STATS = 546;
const T2_STATS = 728;
const T3_STATS = 1275;

class RacingPulse extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statAmount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCorruptionByName("Racing Pulse");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.RACING_PULSE_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.RACING_PULSE_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.RACING_PULSE_T3.id) * T3_STATS;

    this.statTracker.add(SPELLS.RACING_PULSE_BUFF.id, {
      haste: this.statAmount,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RACING_PULSE_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic size="flexible">
        <BoringSpellValueText spell={SPELLS.RACING_PULSE_BUFF}>
          <HasteIcon /> {formatNumber(this.buffUptime * this.statAmount)} <small>average Haste</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default RacingPulse;
