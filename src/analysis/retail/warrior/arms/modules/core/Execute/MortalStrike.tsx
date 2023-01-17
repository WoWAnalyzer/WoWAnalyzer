import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import ExecuteRange from './ExecuteRange';

class MortalStrikeAnalyzer extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    executeRange: ExecuteRange,
  };

  protected abilities!: Abilities;
  protected executeRange!: ExecuteRange;

  private mortalStrikeCasts = 0;
  private mortalStrikesOutsideExecuteRange = 0;
  private mortalStrikesInExecuteRange = 0;

  get mortalStrikeUsageThresholds() {
    const cd = this.abilities.getAbility(SPELLS.MORTAL_STRIKE.id)?.cooldown || 6;
    const max = calculateMaxCasts(
      cd,
      this.owner.fightDuration, //- this.executeRange.executionPhaseDuration(),
      //--NOTE: you no longer stop using mortal strike during execute
    );

    return {
      actual: this.mortalStrikeCasts / max,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  //this bit is irrelevant now.
  // You want to keep Deep wounds active on your target when in execution phase, without overcasting Mortal Strike
  //get notEnoughMortalStrikeThresholds() {
  //  const cd = 12000; //Deep wounds duration
  //  const max = calculateMaxCasts(cd, this.executeRange.executionPhaseDuration());
  //  const maxCast =
  //    this.mortalStrikesInExecuteRange / max > 1 ? this.mortalStrikesInExecuteRange : max;

  //  return {
  //    actual: this.mortalStrikesInExecuteRange / maxCast,
  //    isLessThan: {
  //      minor: 0.9,
  //      average: 0.8,
  //      major: 0.6,
  //    },
  //    style: ThresholdStyle.PERCENTAGE,
  //  };
  //}

  //get tooMuchMortalStrikeThresholds() {
  //  const cd = 12000; //Deep wounds duration
  //  const max = calculateMaxCasts(cd, this.executeRange.executionPhaseDuration());
  //  const maxCast =
  //    this.mortalStrikesInExecuteRange / max > 1 ? this.mortalStrikesInExecuteRange : max;

  //  return {
  //    actual: 1 - this.mortalStrikesInExecuteRange / maxCast,
  //    isGreaterThan: {
  //      minor: 1,
  //      average: 1.15,
  //      major: (maxCast + 1) / maxCast,
  //    },
  //    style: ThresholdStyle.PERCENTAGE,
  //  };
  //}

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MORTAL_STRIKE),
      this._onMortalStrikeCast,
    );
  }

  _onMortalStrikeCast(event: CastEvent) {
    this.mortalStrikeCasts += 1;
    if (this.executeRange.isTargetInExecuteRange(event.targetID || 0, event.targetInstance || 0)) {
      this.mortalStrikesInExecuteRange += 1;

      //event.meta = event.meta || {};
      //event.meta.isInefficientCast = true;
      //event.meta.inefficientCastReason = 'This Mortal Strike was used on a target in Execute range.';
    } else {
      this.mortalStrikesOutsideExecuteRange += 1;
    }
  }

  suggestions(when: When) {
    when(this.mortalStrikeUsageThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to use as many <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> as possible. It is
          generally your strongest hitting ability, unless you are in{' '}
          <SpellLink id={SPELLS.EXECUTE} /> range and have the{' '}
          <SpellLink id={TALENTS.EXECUTIONERS_PRECISION_TALENT} /> talent. Especially with the 4-set
          bonus in Season 1 of Dragonflight, where keeping up your buff up is important.
        </>,
      )
        .icon(SPELLS.MORTAL_STRIKE.icon)
        .actual(
          t({
            id: 'warrior.arms.suggestions.mortalStrike.efficiency',
            message: `Mortal Strike was cast ${
              this.mortalStrikeCasts
            } times accounting for ${formatPercentage(
              actual,
            )}% of the total possible casts of Mortal Strike.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    //when(this.goodMortalStrikeThresholds).addSuggestion((suggest, actual, recommended) =>
    //  suggest(
    //    <>
    //      Try to cast <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> more often when the target is
    //      outside execute range.
    //    </>,
    //  )
    //    .icon(SPELLS.MORTAL_STRIKE.icon)
    //    .actual(
    //      t({
    //        id: 'warrior.arms.suggestions.motalStrike.outsideExecute',
    //        message: `Mortal Strike was used ${formatPercentage(
    //          actual,
    //        )}% of the time on a target outside execute range.`,
    //      }),
    //    )
    //    .recommended(`${formatPercentage(recommended)}% is recommended`),
    //);
  }
}

export default MortalStrikeAnalyzer;
