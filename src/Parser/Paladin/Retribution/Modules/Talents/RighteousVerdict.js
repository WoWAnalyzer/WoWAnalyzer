import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const RIGHTEOUS_VERDICT_MODIFIER = 0.15;

class RighteousVerdict extends Analyzer {
  damageDone = 0;
  spendersInsideBuff = 0;
  totalSpenders = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RIGHTEOUS_VERDICT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TEMPLARS_VERDICT.id) {
      return;
    }
    this.totalSpenders++;
    if (this.selectedCombatant.hasBuff(SPELLS.RIGHTEOUS_VERDICT_BUFF.id)) {
      this.spendersInsideBuff++; 
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.RIGHTEOUS_VERDICT_BUFF.id)) {
      return;
    }
    if (spellId === SPELLS.TEMPLARS_VERDICT_DAMAGE.id) {
      this.damageDone += calculateEffectiveDamage(event, RIGHTEOUS_VERDICT_MODIFIER);
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.spendersInsideBuff / this.totalSpenders,
      isLessThan: {
        minor: 0.80,
        average: 0.75,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Your usage of <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> can be improved. Make sure you aren't letting the <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> buff run out before casting <SpellLink id={SPELLS.TEMPLARS_VERDICT.id} icon/> again</React.Fragment>)
        .icon(SPELLS.RIGHTEOUS_VERDICT_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of Templars Verdicts with the buff`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} />}
        value={formatNumber(this.damageDone)}
        label="Damage Done"
        tooltip={`
           The effective damage contributed by Righteous Verdict.<br/>
           Total Damage: ${formatNumber(this.damageDone)} (${formatPercentage(this.spendersInsideBuff / this.totalSpenders)}%)<br/>
           Buffed Casts: ${formatNumber(this.spendersInsideBuff)} (${formatPercentage(this.spendersInsideBuff / this.totalSpenders)}%)`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default RighteousVerdict;
