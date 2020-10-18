import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events from 'parser/core/Events';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const RIGHTEOUS_VERDICT_MODIFIER = 0.15;

class RighteousVerdict extends Analyzer {
  damageDone = 0;
  spendersInsideBuff = 0;
  totalSpenders = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RIGHTEOUS_VERDICT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TEMPLARS_VERDICT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TEMPLARS_VERDICT_DAMAGE), this.onDamage);
  }

  onCast(event) {
    this.totalSpenders += 1;
  }

  onDamage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.RIGHTEOUS_VERDICT_BUFF.id)) {
      this.spendersInsideBuff += 1;
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your usage of <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> can be improved.  Do not cast <SpellLink id={SPELLS.TEMPLARS_VERDICT.id} icon /> early to try and keep the buff active. Maintaining a proper roatation will passively lead to good <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> efficiency. Consider using another talent if the fight mechanics are preventing you from getting high enough efficiency.</>)
        .icon(SPELLS.RIGHTEOUS_VERDICT_TALENT.icon)
        .actual(i18n._(t('paladin.retribution.suggestions.righteousVerdict.efficiency')`${formatPercentage(actual)}% of Templars Verdicts with the buff.`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(7)}
        icon={<SpellIcon id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} />}
        value={formatNumber(this.damageDone)}
        label="Damage Done"
        tooltip={(
          <>
            The effective damage contributed by Righteous Verdict.<br />
            Total Damage: {formatNumber(this.damageDone)} ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageDone))} %)<br />
            Buffed Casts: {formatNumber(this.spendersInsideBuff)} ({formatPercentage(this.spendersInsideBuff / this.totalSpenders)}%)
          </>
        )}
      />
    );
  }
}

export default RighteousVerdict;
