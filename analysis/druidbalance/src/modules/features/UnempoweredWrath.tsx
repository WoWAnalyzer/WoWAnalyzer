import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import React from 'react';

const UNEMPOWERED_CASTS_NEEDED_FOR_EMPOWERMENT = 2;

class UnempoweredWrath extends Analyzer {
  get badCastsPerMinute() {
    return (
      ((this.badCasts - this.eclipseCount * UNEMPOWERED_CASTS_NEEDED_FOR_EMPOWERMENT) /
        (this.owner.fightDuration / 1000)) *
      60
    );
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
  eclipseCount = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WRATH_MOONKIN), this.onCast);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ECLIPSE_SOLAR),
      this.onApplyBuff,
    );
    this.addEventListener(Events.fightend, this.onFightend);
  }

  checkCast() {
    if (this.lastCastBuffed || !this.lastCast) {
      return;
    }
    // if the player was in neither Eclipse, he used the spell to get into an eclipse, thus this cast is not considered bad
    if (
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR) &&
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR)
    ) {
      return;
    }
    this.badCasts += 1;
    this.lastCast.meta = this.lastCast.meta || {};
    this.lastCast.meta.isInefficientCast = true;
    this.lastCast.meta.inefficientCastReason = `Wrath was cast without Solar Eclipse.`;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.eclipseCount += 1;
  }

  onCast(event: CastEvent) {
    this.lastCast = event;
    this.lastCastBuffed = this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id);
    this.checkCast();
  }

  onFightend() {
    this.checkCast();
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You casted {this.badCasts} unempowered <SpellLink id={SPELLS.WRATH_MOONKIN.id} /> outside
          the {UNEMPOWERED_CASTS_NEEDED_FOR_EMPOWERMENT} needed to get to{' '}
          <SpellLink id={SPELLS.ECLIPSE_SOLAR.id} />
        </>,
      )
        .icon(SPELLS.WRATH_MOONKIN.icon)
        .actual(
          t({
            id: 'druid.balance.suggestions.wrath.efficiency',
            message: `${actual.toFixed(1)} Unempowered Wraths per minute`,
          }),
        )

        .recommended(`${recommended} is recommended`),
    );
  }
}

export default UnempoweredWrath;
