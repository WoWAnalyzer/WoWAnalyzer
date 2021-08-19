import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

const EARTHWARDEN_REDUCTION_MODIFIER = 0.3;

const ABILITIES_THAT_CONSUME_EW = [
  SPELLS.MELEE,
  SPELLS.MAGIC_MELEE,
  SPELLS.RECURSIVE_STRIKES_ENEMY,
];

class Earthwarden extends Analyzer {
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
    return (
      this.percentOfSwingsMitigated * this.meleeDamageContribution * EARTHWARDEN_REDUCTION_MODIFIER
    );
  }

  static dependencies = {
    abilityTracker: AbilityTracker,
    damageTaken: DamageTaken,
  };
  damageFromMelees = 0;
  swingsMitigated = 0;
  totalSwings = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.lv45Talent === SPELLS.EARTHWARDEN_TALENT.id;
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(ABILITIES_THAT_CONSUME_EW),
      this.onDamage,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.EARTHWARDEN_BUFF),
      this.onAbsorbed,
    );
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

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You mitigated {this.swingsMitigated} out of a possible {this.totalSwings} attacks (
            {formatPercentage(this.percentOfSwingsMitigated)}%) with Earthwarden. <br />
            <br />({formatPercentage(this.totalMitigation)}% of total damage,{' '}
            {formatNumber(this.hps)} HPS)
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.EARTHWARDEN_BUFF.id} /> Hits mitigated by Earthwarden{' '}
            </>
          }
        >
          {`${formatPercentage(this.percentOfSwingsMitigated)}%`}
        </BoringValueText>
      </Statistic>
    );
  }

  suggestions(when) {
    // Suggestion 1: EW stacks are not being generated fast enough
    when(this.percentOfSwingsMitigated)
      .isLessThan(0.6)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            <SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> is not mitigating enough potential
            damage to be effective. This is often caused by stacks being consumed too quickly due to
            tanking multiple mobs and/or low <SpellLink id={SPELLS.THRASH_BEAR.id} /> casts.
            Consider using a different talent if you cannot get better usage from Earthwarden.
          </span>,
        )
          .icon(SPELLS.EARTHWARDEN_TALENT.icon)
          .actual(
            t({
              id: 'druid.guardian.suggestions.earthwarden.efficiency',
              message: `${formatPercentage(
                actual,
              )}% of potential damage was mitigated by Earthwarden`,
            }),
          )
          .recommended(`${formatPercentage(recommended, 0)}% or more is recommended`)
          .regular(recommended - 0.1)
          .major(recommended - 0.2),
      );

    // Suggestion 2: Melee damage is not relevant enough for EW to be effective
    when(this.meleeDamageContribution)
      .isLessThan(0.4)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            The damage pattern of this encounter makes{' '}
            <SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> less effective. Consider using a
            different talent that will provide more value against non-melee damage.
          </span>,
        )
          .icon(SPELLS.EARTHWARDEN_TALENT.icon)
          .actual(
            t({
              id: 'druid.guardian.suggestions.earthwarden.notOptimal',
              message: `${formatPercentage(actual)}% of total damage is melee attacks`,
            }),
          )
          .recommended(`${formatPercentage(recommended, 0)}% or more is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.1),
      );
  }
}

export default Earthwarden;
