import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

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
      this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get damageIncreasePercent() {
    return this.damagePercent / (1 - this.damagePercent);
  }

  get uptimeMS() {
    return this.combatants.selected.getBuffUptime(SPELLS.RUNE_OF_POWER_BUFF.id);
  }

  get roundedSecondsPerCast() {
    return ((this.uptimeMS / this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_BUFF.id).casts) / 1000).toFixed(1);
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


  get roundedSecondsSuggestionThresholds() {
    return {
      actual: this.damageIncreasePercent,
      isLessThan: {
        minor: RUNE_DURATION,
        average: RUNE_DURATION - 1,
        major: RUNE_DURATION - 3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.damageSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> damage boost is below the expected passive gain from <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />. Either find ways to make better use of the talent, or switch to <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />.</Wrapper>)
          .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
          .actual(`${formatPercentage(this.damageIncreasePercent)}% damage increase from Rune of Power`)
          .recommended(`${formatPercentage(recommended)}% is the passive gain from Incanter's Flow`);
      });
    if (this.abilityTracker.getAbility(SPELLS.RUNE_OF_POWER_BUFF.id).casts < 1) {
      when(this.roundedSecondsSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You sometimes aren't standing in your <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> for its full duration. Try to only use it when you know you won't have to move for the duration of the effect.</Wrapper>)
            .icon(SPELLS.RUNE_OF_POWER_TALENT.icon)
            .actual(`Average ${this.roundedSecondsPerCast}s standing in each Rune of Power`)
            .recommended(`the full duration of ${formatNumber(RUNE_DURATION)}s is recommended`);
        });
    }
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
