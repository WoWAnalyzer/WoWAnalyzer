import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { t } from '@lingui/macro';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

const TARGETS_FOR_GOOD_CAST = 3;

class UnempoweredLunarStrike extends Analyzer {
  get badCastsPerMinute() {
    return ((this.badCasts) / (this.owner.fightDuration / 1000)) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCastsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  badCasts = 0;
  lastCast?: CastEvent;
  lastCastBuffed = false;
  hits = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LUNAR_STRIKE), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LUNAR_STRIKE), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  checkCast() {
    if (this.lastCastBuffed || this.hits >= TARGETS_FOR_GOOD_CAST || !this.lastCast) {
      return;
    }
    this.badCasts += 1;
    this.lastCast.meta = this.lastCast.meta || {};
    this.lastCast.meta.isInefficientCast = true;
    this.lastCast.meta.inefficientCastReason = `Lunar Strike was cast without Lunar Empowerment, Owlkin Frenzy and Warrior of Elune and hit less than ${TARGETS_FOR_GOOD_CAST} targets.`;
  }

  onCast(event: CastEvent) {
    this.checkCast();
    this.lastCast = event;
    this.lastCastBuffed = this.selectedCombatant.hasBuff(SPELLS.LUNAR_EMP_BUFF.id)
      || this.selectedCombatant.hasBuff(SPELLS.OWLKIN_FRENZY.id)
      || this.selectedCombatant.hasBuff(SPELLS.WARRIOR_OF_ELUNE_TALENT.id);
    this.hits = 0;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
  }

  onFightend() {
    this.checkCast();
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You cast {this.badCasts} unempowered and non instant cast <SpellLink id={SPELLS.LUNAR_STRIKE.id} /> that hit less than {TARGETS_FOR_GOOD_CAST} targets. Always prioritize <SpellLink id={SPELLS.SOLAR_WRATH.id} /> as a filler when none of those conditions are met.</>)
      .icon(SPELLS.LUNAR_STRIKE.icon)
      .actual(t({
      id: "druid.balance.suggestions.lunarStrike.efficiency",
      message: `${actual.toFixed(1)} Unempowered Lunar Strikes per minute`
    }))

      .recommended(`${recommended} is recommended`));
  }
}

export default UnempoweredLunarStrike;
