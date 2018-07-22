import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

class CenedrilReflectorOfHatred extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.CENEDRIL_REFLECTOR_OF_HATRED.id);
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
