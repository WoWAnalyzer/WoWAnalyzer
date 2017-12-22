import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

import getDamageBonus from '../GetDamageBonus';

const DAMAGE_BONUS = 0.4;
const RUNE_DURATION = 10;
const INCANTERS_FLOW_EXPECTED_BOOST = 0.12;

// FIXME due to interactions with Ignite, the damage boost number will be underrated for Fire Mages. Still fine for Arcane and Frost.
class RuneOfPower extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id)) {
      this.damage += getDamageBonus(event, DAMAGE_BONUS);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get damageIncreasePercent() {
    return this.damagePercent / (1 - this.damagePercent);
  }

  get damageSuggestionThresholds() {
    return {
      actual: this.damageIncreasePercent,
      isLessThan: {
        minor: INCANTERS_FLOW_EXPECTED_BOOST,
        average: INCANTERS_FLOW_EXPECTED_BOOST,
        major: INCANTERS_FLOW_EXPECTED_BOOST - 0.03,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.damageIncreasePercent).isLessThan(this.damageSuggestionThresholds.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> damage boost is below the expected passive gain from <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />. Either find ways to make better use of the talent, or switch to <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />.</span>)
          .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
          .actual(`${formatPercentage(this.damageIncreasePercent)}% damage increase from Rune of Power`)
          .recommended(`${formatPercentage(recommended)}% is the passive gain from Incanter's Flow`)
          .regular(this.damageSuggestionThresholds.isLessThan.average).major(this.damageSuggestionThresholds.isLessThan.major);
      });

    const casts = this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_TALENT.id).casts;
    if (!casts) {
      return;
    }

    const uptimeMs = this.combatants.selected.getBuffUptime(SPELLS.RUNE_OF_POWER_BUFF.id);
    const roundedSecondsPerCast = ((uptimeMs / casts) / 1000).toFixed(1);

    when(roundedSecondsPerCast).isLessThan(RUNE_DURATION)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You sometimes aren't standing in your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> for its full duration. Try to only use it when you know you won't have to move for the duration of the effect.</span>)
          .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
          .actual(`Average ${roundedSecondsPerCast}s standing in each Rune of Power`)
          .recommended(`the full duration of ${formatNumber(RUNE_DURATION)}s is recommended`)
          .regular(recommended - 1).major(recommended - 3);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RUNE_OF_POWER_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Rune of Power damage"
        tooltip={`This is the portion of your total damage attributable to Rune of Power's boost. Expressed as an increase vs never using Rune of Power, this is a <b>${formatPercentage(this.damageIncreasePercent)}% damage increase</b>. Note that this number does <i>not</i> factor in the opportunity cost of casting Rune of Power instead of another damaging spell`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(100);
}

export default RuneOfPower;
