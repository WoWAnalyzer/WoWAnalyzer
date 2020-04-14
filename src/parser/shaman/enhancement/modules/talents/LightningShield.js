import React from 'react';
import SPELLS from 'common/SPELLS/index';
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

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.LIGHTNING_SHIELD.id) {
      return;
    }
    this.damageGained += event.amount;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 1,
        average: 0.99,
        major: 0.95,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should fully utilize your <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> by using it before combat.</span>)
          .icon(SPELLS.LIGHTNING_SHIELD_TALENT.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${(formatPercentage(recommended, 0))}% is recommended`);
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
