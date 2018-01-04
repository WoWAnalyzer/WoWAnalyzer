import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import ItemDamageDone from 'Main/ItemDamageDone';

class SoulOfTheGrandmaster extends Analyzer {
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
      result: <ItemDamageDone amount={damage} />,
    };
  }
}

export default SoulOfTheGrandmaster;
