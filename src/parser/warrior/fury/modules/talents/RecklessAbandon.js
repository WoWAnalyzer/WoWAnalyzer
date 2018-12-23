import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const BASE_RECKLESSNESS_DURATION = 10 * 1000; // 10 seconds;

class RecklessAbandon extends Analyzer {
  damage = 0;
  instantRageGained = 0;
  rageGained = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTalent(SPELLS.RECKLESS_ABANDON_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.onRecklessAbandonEnergize);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).to(SELECTED_PLAYER), this.onPlayerEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  hasLast4SecondsOfRecklessness(event) {
    const reck = this.selectedCombatant.getBuff(SPELLS.RECKLESSNESS.id);
    return reck && ((event.timestamp - reck.start) > BASE_RECKLESSNESS_DURATION);
  }

  onRecklessAbandonEnergize(event) {
    this.instantRageGained += event.resourceChange;
  }

  onPlayerEnergize(event) {
    if (this.hasLast4SecondsOfRecklessness(event)) {
      this.rageGained += event.resourceChange / 2;
    }
  }

  onPlayerDamage(event) {
    if (this.hasLast4SecondsOfRecklessness(event)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.RECKLESS_ABANDON_TALENT.id}
        value={`${formatNumber(this.instantRageGained)} instant rage`}
        label="Reckless Abandon"
        tooltip={`In the 4 additional seconds of Recklessness caused by Reckless Abandon:<br />
        Additional rage generated: <b>${this.rageGained}</b><br />
        Damage dealt: <b>${formatNumber(this.damage)} (${formatPercentage(this.damagePercent)}%)</b>`}
      />
    );
  }
}

export default RecklessAbandon;