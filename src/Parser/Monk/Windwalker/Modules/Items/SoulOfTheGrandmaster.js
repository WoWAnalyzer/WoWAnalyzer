import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

class SoulOfTheGrandmaster extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_GRANDMASTER.id);
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
