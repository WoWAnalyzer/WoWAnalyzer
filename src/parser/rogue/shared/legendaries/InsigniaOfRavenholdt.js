import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import DamageTracker from 'parser/core/modules/AbilityTracker';
import ItemDamageDone from 'interface/others/ItemDamageDone';

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
