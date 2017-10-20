import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class SoulOfTheGrandmaster extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_GRANDMASTER.id);
  }

  item() {
    const chiOrbit = this.abilityTracker.getAbility(SPELLS.CHI_ORBIT_DAMAGE.id);
    const damage = chiOrbit.damageEffective;

    return {
      item: ITEMS.SOUL_OF_THE_GRANDMASTER,
      result: this.owner.formatItemDamageDone(damage),
    };
  }
}

export default SoulOfTheGrandmaster;
