import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellLink from 'common/SpellLink';

class LightningShield extends Analyzer {
  damageGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHTNING_SHIELD_TALENT.id);
  }

  isEventLightningShield(event) {
    switch (event.ability.guid) {
      case SPELLS.LIGHTNING_SHIELD_OVERCHARGE.id:
      case SPELLS.LIGHTNING_SHIELD.id:
        return true;
    }
    return false;
  }

  on_byPlayer_damage(event) {
    if (this.isEventLightningShield(event) === false) {
      return;
    }
    this.damageGained += event.amount;
  }

  on_byPlayer_energize(event) {
    if (this.isEventLightningShield(event) === false) {
      return;
    }
    this.maelstromGained += event.amount;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  suggestions(when) {
    const lightningUptime = this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD_TALENT.id) / this.owner.fightDuration;

    when(lightningUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should fully utilize your <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> by using it before combat.</span>)
          .icon(SPELLS.LIGHTNING_SHIELD_TALENT.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${(formatPercentage(recommended, 0))}% is recommended`)
          .major(recommended - 0.5);
      });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.LIGHTNING_SHIELD_TALENT.id}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default LightningShield;
