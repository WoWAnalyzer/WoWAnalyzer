import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, BeginCastEvent, CastEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';

const COMBUSTION_PRE_CASTS = [
  SPELLS.FIREBALL,
  SPELLS.PYROBLAST,
  SPELLS.SCORCH,
  SPELLS.PHOENIX_FLAMES,
  SPELLS.FLAMESTRIKE,
];

class CombustionPreCastDelay extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  castStartedTimestamp = 0;
  combustionTimestamp = 0;
  totalCastDelay = 0;
  combustionCasts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustion);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(COMBUSTION_PRE_CASTS), this.onPreCastStarted);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(COMBUSTION_PRE_CASTS), this.onPreCastFinished);
  }

  onCombustion(event: ApplyBuffEvent) {
    this.combustionTimestamp = event.timestamp;
  }

  onPreCastStarted(event: BeginCastEvent) {
    this.castStartedTimestamp = event.timestamp;
    if (this.combustionTimestamp !== 0) {
      const castDelay = event.timestamp - this.combustionTimestamp;
      this.totalCastDelay += castDelay;
      this.combustionCasts[this.combustionTimestamp] = castDelay;
      this.castStartedTimestamp = 0;
      this.combustionTimestamp = 0;
    }
  }

  onPreCastFinished(event: CastEvent) {
    if (this.combustionTimestamp === 0) {
      this.castStartedTimestamp = 0;
      return;
    }
    const castDelay = event.timestamp - this.combustionTimestamp;
    this.totalCastDelay += castDelay;
    this.combustionCasts[this.combustionTimestamp] = castDelay;
    this.castStartedTimestamp = 0;
    this.combustionTimestamp = 0;
  }

  get averageCastDelay() {
    return this.totalCastDelay / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts / 1000;
  }

  get combustionCastDelayThresholds() {
    return {
      actual: this.averageCastDelay,
      isGreaterThan: {
        minor: 0.7,
        average: 1,
        major: 1.5,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.combustionCastDelayThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>On average, you used <SpellLink id={SPELLS.COMBUSTION.id} /> with {this.averageCastDelay} seconds left on your pre-cast ability (The spell you were casting when you used <SpellLink id={SPELLS.COMBUSTION.id} />). In order to maximize the number of casts you can get in during <SpellLink id={SPELLS.COMBUSTION.id} />, it is recommended that you are activating <SpellLink id={SPELLS.COMBUSTION.id} /> closer to the end of your pre-cast (preferably within {recommended} seconds of the cast completing).</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(<Trans id="mage.fire.suggestions.combustion.castDelay">{actual}s Avg. Pre-Cast Delay</Trans>)
          .recommended(`${recommended} is recommended`));
  }
}
export default CombustionPreCastDelay;
