import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber, formatThousands } from 'common/format';
import StatisticBox from 'interface/others/StatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

class Enrage extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  }

  totalDamage = 0;
  damage = 0;

  constructor(...args) {
    super(...args);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  onPlayerDamage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.ENRAGE.id)) {
      this.damage += calculateEffectiveDamage(event, this.statTracker.currentMasteryPercentage);
      this.totalDamage += event.amount;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ENRAGE.id) / this.owner.fightDuration;
  }

  get dpsIncrease () {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  get damageTotalPercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get dpsPercent() {
    return formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage) / this.owner.getPercentageOfTotalDamageDone(this.dpsIncrease));
  }

  get suggestionThresholds() {
    return {
      actual: this.enrageUptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your <SpellLink id={SPELLS.ENRAGE.id} /> uptime can be improved.</>)
          .icon(SPELLS.ENRAGE.icon)
          .actual(`${formatPercentage(actual)}% Enrage uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ENRAGE.id} />}
        value={`${formatPercentage(this.uptime)}% uptime`}
        label="Enrage"
        tooltip={`You did <b>${formatThousands(this.damage)}</b> damage while enraged, contributing <b>${formatNumber(this.dpsIncrease)} (${this.dpsPercent}%)</b> DPS.`}
      />
    );
  }
}

export default Enrage;
