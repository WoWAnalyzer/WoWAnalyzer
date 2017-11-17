import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class Roots extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasLegs(ITEMS.ROOTS_OF_SHALADRASSIL.id);
  }

  item() {
    const healing = this.abilityTracker.getAbility(SPELLS.ROOTS_OF_SHALADRASSIL_HEAL.id).healingEffective + this.cooldownThroughputTracker.getIndirectHealing(SPELLS.ROOTS_OF_SHALADRASSIL_HEAL.id);
    return {
        item: ITEMS.ROOTS_OF_SHALADRASSIL,
        result: this.owner.formatItemHealingDone(healing),
    };
  }
}

export default Roots;