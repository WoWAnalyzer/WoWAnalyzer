import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';

const UNEMPOWERED_CASTS_NEEDED_FOR_EMPOWERMENT = 2;
const TARGETS_FOR_GOOD_CAST = 5;

class UnempoweredStarfire extends Analyzer {
  get badCastsPerMinute() {
    return ((this.badCasts - (this.eclipseCount * UNEMPOWERED_CASTS_NEEDED_FOR_EMPOWERMENT)) / (this.owner.fightDuration / 1000)) * 60;
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
  eclipseCount = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFIRE), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARFIRE), this.onDamage);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ECLIPSE_LUNAR), this.onApplyBuff);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  checkCast() {
    if (this.lastCastBuffed || this.hits >= TARGETS_FOR_GOOD_CAST || !this.lastCast) {
      return;
    }
    this.badCasts += 1;
    this.lastCast.meta = this.lastCast.meta || {};
    this.lastCast.meta.isInefficientCast = true;
    this.lastCast.meta.inefficientCastReason = `Starfire was cast without Lunar Eclipse, Owlkin Frenzy and Warrior of Elune and hit less than ${TARGETS_FOR_GOOD_CAST} targets.`;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.eclipseCount += 1;
  }

  onCast(event: CastEvent) {
    this.checkCast();
    this.lastCast = event;
    this.lastCastBuffed = this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id)
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You casted {this.badCasts} unempowered and non instant cast <SpellLink id={SPELLS.STARFIRE.id} /> that hit less than {TARGETS_FOR_GOOD_CAST} targets, outside the {UNEMPOWERED_CASTS_NEEDED_FOR_EMPOWERMENT} needed to get to <SpellLink id={SPELLS.ECLIPSE_LUNAR.id} /></>)
      .icon(SPELLS.STARFIRE.icon)
      .actual(t({
        id: "druid.balance.suggestions.starfire.efficiency",
        message: `${actual.toFixed(1)} Unempowered Starfires per minute`
      }))

      .recommended(`${recommended} is recommended`));
  }
}

export default UnempoweredStarfire;
