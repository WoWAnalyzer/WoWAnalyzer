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
    // const fightLengthSec = this.owner.fightDuration / 1000;
    const symbioteStrike = this.abilityTracker.getAbility(SPELLS.SYMBIOTE_STRIKE.id);
    const dps = symbioteStrike.damageEffective; // fightLengthSec;
    const hps = symbioteStrike.healingEffective; // fightLengthSec;

    return {
      item: ITEMS.CINIDARIA_THE_SYMBIOTE,
      result: (
        <span>
          {this.owner.formatItemDamageDone(dps)} <br/> {this.owner.formatItemHealingDone(hps)}
        </span>
      ),
    };
  }
}

export default Cinidaria;
