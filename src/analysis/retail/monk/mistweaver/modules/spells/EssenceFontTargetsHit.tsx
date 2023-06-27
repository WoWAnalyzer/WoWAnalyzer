import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class EssenceFontTargetsHit extends Analyzer {
  efCasts: number = 0;
  targetsEF: number = 0;
  hitsBeforeCast: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
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
          You are currently using not utilizing your{' '}
          <SpellLink spell={TALENTS_MONK.ESSENCE_FONT_TALENT} /> effectively. Each{' '}
          <SpellLink spell={TALENTS_MONK.ESSENCE_FONT_TALENT} /> cast should hit a total of 18
          targets. Either hold the cast til 6 or more targets are injured or move while casting to
          increase the effective range of the spell.
        </>,
      )
        .icon(TALENTS_MONK.ESSENCE_FONT_TALENT.icon)
        .actual(
          `${this.avgTargetsHitPerEF.toFixed(2)}${defineMessage({
            id: 'monk.mistweaver.suggestions.essenceFont.averageTargetsHit',
            message: `average targets hit per cast`,
          })}`,
        )
        .recommended(`${recommended} targets hit is recommended`),
    );
  }
}

export default EssenceFontTargetsHit;
