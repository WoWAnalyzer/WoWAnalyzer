import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';


const SIEGEBREAKER_DAMAGE_MODIFIER = 0.15;

// Example log: https://www.warcraftlogs.com/reports/QHjLTpxknR47CZhm#fight=6&type=damage-done&source=5
class Siegebreaker extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  }

  protected enemies!: Enemies;

  damage: number = 0;
  goodRecklessness: number = 0;
  recklessnessCasted: number = 0;
  inValidRecklessness: boolean = false;
  siegeCasted: boolean = false;
  lastRecklessness: CastEvent | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SIEGEBREAKER_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SIEGEBREAKER_TALENT), this.siegeTurnOn);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.playerCastedRecklessness);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.buffCheck);
    this.addEventListener(Events.fightend, this.buffCheck);
  }

  playerCastedRecklessness(event: CastEvent) {
    this.inValidRecklessness = true;
    this.recklessnessCasted += 1;
    this.lastRecklessness = event;
  }

  siegeTurnOn() {
    if (this.inValidRecklessness) {
      this.siegeCasted = true;
    }
  }

  buffCheck() {
    if (this.inValidRecklessness && this.siegeCasted) {
      this.goodRecklessness += 1;
    } else if (this.inValidRecklessness) {
      // lastRecklessness cant be null when validRecklesness is true
      this.lastRecklessness!.meta = {
        isInefficientCast: true,
        inefficientCastReason: `You didn't cast Siege Breaker during this Recklessness.`,
      };
    }
    this.inValidRecklessness = false;
    this.siegeCasted = false;
  }

  onPlayerDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.SIEGEBREAKER_DEBUFF.id)) {
      this.damage += calculateEffectiveDamage(event, SIEGEBREAKER_DAMAGE_MODIFIER);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get dpsValue() {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  get suggestionThresholds() {
    return {
      actual: (this.goodRecklessness / this.recklessnessCasted),
      isLessThan: {
        minor: .9,
        average: .8,
        major: .7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You're not casting <SpellLink id={SPELLS.SIEGEBREAKER_TALENT.id} /> and <SpellLink id={SPELLS.RECKLESSNESS.id} /> together.</>)
      .icon(SPELLS.SIEGEBREAKER_TALENT.icon)
      .actual(i18n._(t('warrior.fury.suggestions.siegeBreaker.efficiency')`${formatPercentage(actual)}% of Recklessnesses casts without a Siegebreaker cast`))
      .recommended(`${formatPercentage(recommended)}+% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<><strong>{formatThousands(this.damage)} ({formatPercentage(this.damagePercent)}%)</strong> of your damage can be attributed to Siegebreaker's damage bonus.</>}
      >
        <BoringSpellValueText spell={SPELLS.SIEGEBREAKER_TALENT}>
          <>
            {formatThousands(this.dpsValue)} DPS
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
 export default Siegebreaker;
