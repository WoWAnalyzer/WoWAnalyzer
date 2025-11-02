import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { ThresholdStyle } from 'parser/core/ParseResults';

import SpellUsable from '../features/SpellUsable';
import ExecuteRange from './Execute/ExecuteRange';
import { addEnhancedCastReason, addInefficientCastReason } from 'parser/core/EventMetaLib';

class Slam extends Analyzer {
  static dependencies = {
    executeRange: ExecuteRange,
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected executeRange!: ExecuteRange;
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  badCast = 0;
  totalCast = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SLAM), this._onSlamCast);
  }

  get badCastSuggestionThresholds() {
    return {
      actual: this.badCast / this.totalCast || 0,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _onSlamCast(event: CastEvent) {
    this.totalCast += 1;
    if (
      this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id) &&
      !this.executeRange.isTargetInExecuteRange(event.targetID || 0, event.targetInstance || 0)
    ) {
      addInefficientCastReason(
        event,
        'This Slam was used on a target while Mortal Strike was off cooldown.',
      );
      this.badCast += 1;
    } else if (
      this.executeRange.isTargetInExecuteRange(event.targetID || 0, event.targetInstance || 0)
    ) {
      addEnhancedCastReason(event, 'This Slam consumed a Crushing Assasult buff.');
    }
  }
}

export default Slam;
