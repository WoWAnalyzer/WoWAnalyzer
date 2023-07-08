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
    } else {
      this.mortalStrikesOutsideExecuteRange += 1;
    }
  }

  suggestions(when: When) {
    when(this.mortalStrikeUsageThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to use as many <SpellLink spell={SPELLS.MORTAL_STRIKE} icon /> as possible. It is
          generally your strongest hitting ability, unless you are in{' '}
          <SpellLink spell={SPELLS.EXECUTE} /> range and have the{' '}
          <SpellLink spell={TALENTS.EXECUTIONERS_PRECISION_TALENT} /> talent. Especially with the
          4-set bonus in Season 1 of Dragonflight, where keeping up your buff up is important.
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
  }
}

export default MortalStrikeAnalyzer;
