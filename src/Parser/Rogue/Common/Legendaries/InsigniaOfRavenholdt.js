import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

class InsigniaOfRavenholdt extends Analyzer {
  static dependencies = {
		damageTracker: DamageTracker,
  };

	constructor(...args) {
	  super(...args);
		this.active = this.selectedCombatant.hasFinger(ITEMS.INSIGNIA_OF_RAVENHOLDT.id);
  }

  item() {
    const damage = this.damageTracker.getAbility(SPELLS.INSIGNIA_OF_RAVENHOLDT.id).damageEffective;

    return {
      item: ITEMS.INSIGNIA_OF_RAVENHOLDT,
      result: <ItemDamageDone amount={damage} />,
    };
  }
}

export default InsigniaOfRavenholdt;
