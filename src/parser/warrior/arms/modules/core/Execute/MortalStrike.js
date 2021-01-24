import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Abilities from 'parser/core/modules/Abilities';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import Events from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle } from 'parser/core/ParseResults';

import ExecuteRange from './ExecuteRange';

class MortalStrikeAnalyzer extends Analyzer {
  get goodMortalStrikeThresholds() {
    const cd = this.abilities.getAbility(SPELLS.MORTAL_STRIKE.id).cooldown;
    const max = calculateMaxCasts(cd, this.owner.fightDuration - this.executeRange.executionPhaseDuration());
    const maxCast = this.mortalStrikesOutsideExecuteRange / max > 1 ? this.mortalStrikesOutsideExecuteRange : max;

    return {
      actual: this.mortalStrikesOutsideExecuteRange / maxCast,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // You want to keep Deep wounds active on your target when in execution phase, without overcasting Mortal Strike
  get notEnoughMortalStrikeThresholds() {
	const cd = 12000;//Deep wounds duration
    const max = calculateMaxCasts(cd, this.executeRange.executionPhaseDuration());
    const maxCast = this.mortalStrikesInExecuteRange / max > 1 ? this.mortalStrikesInExecuteRange : max;

	return {
      actual: this.mortalStrikesInExecuteRange / maxCast,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  
  get tooMuchMortalStrikeThresholds() {
	const cd = 12000;//Deep wounds duration
    const max = calculateMaxCasts(cd, this.executeRange.executionPhaseDuration());
    const maxCast = this.mortalStrikesInExecuteRange / max > 1 ? this.mortalStrikesInExecuteRange : max;

	return {
      actual: 1-(this.mortalStrikesInExecuteRange / maxCast),
      isGreaterThan: {
        minor: 1,
        average: 1.15,
        major: (maxCast + 1) / maxCast,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    abilities: Abilities,
    executeRange: ExecuteRange,
  };
  mortalStrikesOutsideExecuteRange = 0;
  mortalStrikesInExecuteRange = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MORTAL_STRIKE), this._onMortalStrikeCast);
  }

  _onMortalStrikeCast(event) {
    if (this.executeRange.isTargetInExecuteRange(event)) {
	  this.mortalStrikesInExecuteRange += 1;

      //event.meta = event.meta || {};
      //event.meta.isInefficientCast = true;
      //event.meta.inefficientCastReason = 'This Mortal Strike was used on a target in Execute range.';
    } else {
      this.mortalStrikesOutsideExecuteRange += 1;
    }
  }
  
  suggestions(when) {
  when(this.tooMuchMortalStrikeThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Try to avoid using <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> too much on a target in <SpellLink id={SPELLS.EXECUTE.id} icon /> range, as <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> is less rage efficient than <SpellLink id={SPELLS.EXECUTE.id} />.</>)
      .icon(SPELLS.MORTAL_STRIKE.icon)
      .actual(t({
        id: 'warrior.arms.suggestions.mortalStrike.efficiency',
        message: `Mortal Strike was cast ${this.mortalStrikesInExecuteRange} times accounting for ${formatPercentage(actual)}% of the total possible casts of Mortal Strike during a time a target was in execute range.`,
      }))
      .recommended(`${formatPercentage(recommended)}% is recommended`));
  when(this.goodMortalStrikeThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Try to cast <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> more often when the target is outside execute range.</>)
      .icon(SPELLS.MORTAL_STRIKE.icon)
      .actual(t({
        id: 'warrior.arms.suggestions.motalStrike.outsideExecute',
        message: `Mortal Strike was used ${formatPercentage(actual)}% of the time on a target outside execute range.`,
      }))
      .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default MortalStrikeAnalyzer;
