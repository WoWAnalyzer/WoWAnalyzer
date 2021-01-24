import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { CastEvent, DamageEvent, EnergizeEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';

// Example log: /reports/tBFv8P9R3kdDgHKJ#fight=1&type=damage-done&source=19
class DragonRoar extends Analyzer {

  targetsSlowed: number = 0;
  totalDamage: number = 0;
  rageGained: number = 0;
  goodCast: number = 0;
  totalCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.enrageCheck);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarEnergize);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarSlow);
  }

  get percentageDamage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  get suggestionThresholds() {
    return {
      actual: (this.goodCast / this.totalCasts),
      isLessThan: {
        minor: .9,
        average: .8,
        major: .7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  enrageCheck(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.ENRAGE.id)) {
      this.goodCast += 1;
    } else {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You casted Dragons Roar outside of Enrage.`;
    }
    this.totalCasts += 1;
  }

  onDragonRoarDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onDragonRoarEnergize(event: EnergizeEvent) {
    this.rageGained += event.resourceChange;
  }

  onDragonRoarSlow() {
    this.targetsSlowed += 1;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You're casting <SpellLink id={SPELLS.BLADESTORM_TALENT.id} /> outside of enrage.</>)
      .icon(SPELLS.SIEGEBREAKER_TALENT.icon)
      .actual(t({
      id: "warrior.fury.suggestions.dragonRoar.efficiency",
      message: `${formatPercentage(1 - actual)}% of Bladestorm casts outside of enrage`
    }))
      .recommended(`${formatPercentage(recommended)}+% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            Damage done: <strong>{formatThousands(this.totalDamage)} ({formatPercentage(this.percentageDamage)}%)</strong><br />
            Rage gained: <strong>{formatThousands(this.rageGained)}</strong><br />
            Enemies slowed: <strong>{formatThousands(this.targetsSlowed)}</strong>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DRAGON_ROAR_TALENT}>
          <>
            {formatNumber(this.totalDamage / this.owner.fightDuration * 1000)} DPS
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DragonRoar;
