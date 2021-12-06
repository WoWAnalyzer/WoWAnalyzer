import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import React from 'react';

class EssenceFontTargetsHit extends Analyzer {
  efCasts: number = 0;
  targetsEF: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT),
      this.castEssenceFont,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.boltHit,
    );
  }

  castEssenceFont(event: CastEvent) {
    this.efCasts += 1;
  }

  boltHit(event: HealEvent) {
    // if this is here and is true then we don't care
    if (event.tick) {
      return;
    }

    this.targetsEF += 1;
  }

  get avgTargetsHitPerEF() {
    return this.targetsEF / this.efCasts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerEF,
      isLessThan: {
        minor: 17,
        average: 14,
        major: 12,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are currently using not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} />{' '}
          effectively. Each <SpellLink id={SPELLS.ESSENCE_FONT.id} /> cast should hit a total of 18
          targets. Either hold the cast til 6 or more targets are injured or move while casting to
          increase the effective range of the spell.
        </>,
      )
        .icon(SPELLS.ESSENCE_FONT.icon)
        .actual(
          `${this.avgTargetsHitPerEF.toFixed(2)}${t({
            id: 'monk.mistweaver.suggestions.essenceFont.averageTargetsHit',
            message: `average targets hit per cast`,
          })}`,
        )
        .recommended(`${recommended} targets hit is recommended`),
    );
  }
}

export default EssenceFontTargetsHit;
