import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Module from 'Parser/Core/Module';

class Cinidaria extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.CINIDARIA_THE_SYMBIOTE.id);
  }

  item() {
    const symbioteStrike = this.abilityTracker.getAbility(SPELLS.SYMBIOTE_STRIKE.id);
    const damage = symbioteStrike.damageEffective;
    const healing = symbioteStrike.healingEffective;

    return {
      item: ITEMS.CINIDARIA_THE_SYMBIOTE,
      result: (
        <span>
          {this.owner.formatItemDamageDone(damage)} <br/> {this.owner.formatItemHealingDone(healing)}
        </span>
      ),
    };
  }
}

export default Cinidaria;
