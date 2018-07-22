import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

/**
 * Cinidaria, the Symbiote -
 * Equip: Your attacks cause an additional 30% damage to enemies above 90% health and heal you for 100% of the damage done.
 */
class CinidariaTheSymbiote extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWaist(ITEMS.CINIDARIA_THE_SYMBIOTE.id);
  }

  item() {
    const symbioteStrike = this.abilityTracker.getAbility(SPELLS.SYMBIOTE_STRIKE.id);
    const damage = symbioteStrike.damageEffective;
    const healing = symbioteStrike.healingEffective;

    return {
      item: ITEMS.CINIDARIA_THE_SYMBIOTE,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={damage} /><br />
          <ItemHealingDone amount={healing} />
        </React.Fragment>
      ),
    };
  }
}

export default CinidariaTheSymbiote;
