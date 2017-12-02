import React from 'react';

import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Analyzer from 'Parser/Core/Analyzer';

class Cinidaria extends Analyzer {
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
        <Wrapper>
          {this.owner.formatItemDamageDone(damage)}<br/>
          {this.owner.formatItemHealingDone(healing)}
        </Wrapper>
      ),
    };
  }
}

export default Cinidaria;
