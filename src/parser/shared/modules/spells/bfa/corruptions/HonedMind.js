import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import MasteryIcon from 'interface/icons/Mastery';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

// yes these are static
const T1_STATS = 392;
const T2_STATS = 523;
const T3_STATS = 915;

class HonedMind extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statAmount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCorruptionByName("Honed Mind");
    if (!this.active) {
      return;
    }

    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.HONED_MIND_T1.id) * T1_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.HONED_MIND_T2.id) * T2_STATS;
    this.statAmount += this.selectedCombatant.getCorruptionCount(SPELLS.HONED_MIND_T3.id) * T3_STATS;

    this.statTracker.add(SPELLS.HONED_MIND_BUFF.id, {
      mastery: this.statAmount,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.HONED_MIND_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic size="flexible">
        <BoringSpellValueText spell={SPELLS.HONED_MIND_BUFF}>
          <MasteryIcon /> {formatNumber(this.buffUptime * this.statAmount)} <small>average Mastery</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default HonedMind;
