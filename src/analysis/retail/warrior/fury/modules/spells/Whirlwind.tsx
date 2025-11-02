import RageTracker from 'analysis/retail/warrior/shared/modules/core/RageTracker';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from '../features/SpellUsable';

import { addInefficientCastReason } from 'parser/core/EventMetaLib';

class Whirlwind extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    rageTracker: RageTracker,
  };

  wwCast = 0;
  badWWCast = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.WHIRLWIND_FURY_CAST, SPELLS.THUNDER_CLAP]),
      this.onCast,
    );
  }

  get threshold() {
    return this.badWWCast / this.wwCast;
  }

  get suggestionThresholds() {
    return {
      actual: this.threshold,
      isGreaterThan: {
        minor: 0.05,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    this.wwCast += 1;

    const wwBuffStacks = this.selectedCombatant.getBuffStacks(SPELLS.WHIRLWIND_BUFF);

    if (wwBuffStacks > 0) {
      this.badWWCast += 1;
      addInefficientCastReason(
        event,
        'Not all stacks of the Whirlwind buff were used before refreshing stacks',
      );
    }
  }
}

export default Whirlwind;
