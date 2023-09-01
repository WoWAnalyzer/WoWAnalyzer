import ITEMS from 'common/ITEMS/dragonflight';
import SPELLS from 'common/SPELLS/dragonflight/trinkets';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import StatTracker from 'parser/shared/modules/StatTracker';

class AcceleratingSandglass extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(options: Options & { statTracker: StatTracker }) {
    super(options);

    const item = this.selectedCombatant.getItem(ITEMS.ACCELERATING_SANDGLASS.id);
    if (item == null) {
      this.active = false;
      return;
    }

    const haste = calculateSecondaryStatDefault(421, 93, item.itemLevel);

    options.statTracker.add(SPELLS.ACCELERATING_SANDGLASS_DRAINING.id, {
      haste,
    });
  }
}

export default AcceleratingSandglass;
