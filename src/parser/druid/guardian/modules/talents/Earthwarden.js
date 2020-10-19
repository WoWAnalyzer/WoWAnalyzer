import React from 'react';

import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';

import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { formatNumber, formatPercentage } from 'common/format';
import Events from 'parser/core/Events';

const EARTHWARDEN_REDUCTION_MODIFIER = 0.3;

const ABILITIES_THAT_CONSUME_EW = [
  SPELLS.MELEE,
  SPELLS.MAGIC_MELEE,
  SPELLS.RECURSIVE_STRIKES_ENEMY,
];

class Earthwarden extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    damageTaken: DamageTaken,
  };

  damageFromMelees = 0;
  swingsMitigated = 0;
  totalSwings = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.lv90Talent === SPELLS.EARTHWARDEN_TALENT.id;
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(ABILITIES_THAT_CONSUME_EW), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EARTHWARDEN_BUFF), this.onAbsorbed);
  }

  onDamage(event) {
    this.damageFromMelees += event.amount + event.absorbed;

    // Dodged swings and fully absorbed swings should not count towards total swings,
    // since we only care about attacks that EW would have mitigated
    if (event.hitType !== HIT_TYPES.DODGE || event.amount > 0) {
      this.totalSwings += 1;
    }
  }

  onAbsorbed(event) {
    this.swingsMitigated += 1;
  }

  get hps() {
    const healingDone = this.abilityTracker.getAbility(SPELLS.EARTHWARDEN_BUFF.id).healingEffective;
    const fightLengthSec = this.owner.fightDuration / 1000;
    return healingDone / fightLengthSec;
  }

  get percentOfSwingsMitigated() {
    return this.swingsMitigated / this.totalSwings;
  }

  get meleeDamageContribution() {
    const totalDamageTaken = this.damageTaken.total.effective;
    return this.damageFromMelees / totalDamageTaken;
  }

  get totalMitigation() {
    return this.percentOfSwingsMitigated * this.meleeDamageContribution * EARTHWARDEN_REDUCTION_MODIFIER;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTHWARDEN_BUFF.id} />}
        label="Hits mitigated by Earthwarden"
        value={`${formatPercentage(this.percentOfSwingsMitigated)}%`}
        tooltip={(
          <>
            You mitigated {this.swingsMitigated} out of a possible {this.totalSwings} attacks ({formatPercentage(this.percentOfSwingsMitigated)}%) with Earthwarden. <br /><br />

            ({formatPercentage(this.totalMitigation)}% of total damage, {formatNumber(this.hps)} HPS)
          </>
        )}
      />
    );
  }

  suggestions(when) {
    // Suggestion 1: EW stacks are not being generated fast enough
    when(this.percentOfSwingsMitigated).isLessThan(0.6)
      .addSuggestion((suggest, actual, recommended) => suggest(<span><SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> is not mitigating enough potential damage to be effective.  This is often caused by stacks being consumed too quickly due to tanking multiple mobs and/or low <SpellLink id={SPELLS.THRASH_BEAR.id} /> casts.  Consider using a different talent if you cannot get better usage from Earthwarden.</span>)
          .icon(SPELLS.EARTHWARDEN_TALENT.icon)
          .actual(i18n._(t('druid.guardian.suggestions.earthwarden.efficiency')`${formatPercentage(actual)}% of potential damage was mitigated by Earthwarden`))
          .recommended(`${formatPercentage(recommended, 0)}% or more is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2));

    // Suggestion 2: Melee damage is not relevant enough for EW to be effective
    when(this.meleeDamageContribution).isLessThan(0.4)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>The damage pattern of this encounter makes <SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> less effective. Consider using a different talent that will provide more value against non-melee damage.</span>)
          .icon(SPELLS.EARTHWARDEN_TALENT.icon)
          .actual(i18n._(t('druid.guardian.suggestions.earthwarden.notOptimal')`${formatPercentage(actual)}% of total damage is melee attacks`))
          .recommended(`${formatPercentage(recommended, 0)}% or more is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.1));
  }
}

export default Earthwarden;
