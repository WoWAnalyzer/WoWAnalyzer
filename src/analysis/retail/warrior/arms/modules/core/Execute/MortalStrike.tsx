import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle } from 'parser/core/ParseResults';

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
}

export default MortalStrikeAnalyzer;
