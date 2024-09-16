import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

// https://stormearthandlava.com/guide/general/priority_list.html
const TARGETS_FOR_GOOD_CAST = 2;

class SubOptimalChainLightning extends Analyzer {
  get badCastsPerMinute() {
    return (this.badCasts / (this.owner.fightDuration / 1000)) * 60;
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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_LIGHTNING_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_LIGHTNING_TALENT),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  checkCast() {
    if (this.hits >= TARGETS_FOR_GOOD_CAST || !this.lastCast) {
      return;
    }
    this.badCasts += 1;
    addInefficientCastReason(
      this.lastCast,
      `Chain Lightning hit less than ${TARGETS_FOR_GOOD_CAST} targets.`,
    );
  }

  onCast(event: CastEvent) {
    this.checkCast();
    this.lastCast = event;
    this.hits = 0;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
  }

  onFightEnd() {
    this.checkCast();
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast {this.badCasts} <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> that hit
          less than {TARGETS_FOR_GOOD_CAST} targets. Always prioritize{' '}
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> as a filler when there are less than{' '}
          {TARGETS_FOR_GOOD_CAST} targets.
        </>,
      )
        .icon(TALENTS.CHAIN_LIGHTNING_TALENT.icon)
        .actual(
          defineMessage({
            id: 'shaman.elemental.suggestions.chainLightning.efficiency',
            message: `${actual.toFixed(1)} bad Chain Lightning per minute`,
          }),
        )

        .recommended(`${recommended} is recommended`),
    );
  }
}

export default SubOptimalChainLightning;
