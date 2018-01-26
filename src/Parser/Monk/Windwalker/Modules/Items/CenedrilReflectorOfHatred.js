import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import ItemDamageDone from 'Main/ItemDamageDone';

class CenedrilReflectorOfHatred extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.CENEDRIL_REFLECTOR_OF_HATRED.id);
  }

  item() {
    const touchOfKarma = this.abilityTracker.getAbility(SPELLS.TOUCH_OF_KARMA_DAMAGE.id);
    const damage = touchOfKarma.damageEffective * 0.6;

    return {
      item: ITEMS.CENEDRIL_REFLECTOR_OF_HATRED,
      result: <ItemDamageDone amount={damage} />,
    };
  }
}

export default CenedrilReflectorOfHatred;
