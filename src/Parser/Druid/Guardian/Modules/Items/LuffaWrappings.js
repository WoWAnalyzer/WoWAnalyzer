import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const LUFFA_DAMAGE_MODIFIER = 0.25;

class LuffaWrappings extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damageDone = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.LUFFA_WRAPPINGS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.THRASH_BEAR.id || event.ability.guid === SPELLS.THRASH_BEAR_DOT.id) {
      this.damageDone += (event.amount + event.absorbed) * LUFFA_DAMAGE_MODIFIER / (1 + LUFFA_DAMAGE_MODIFIER);
    }
  }

  item() {
    const fightLengthSec = this.owner.fightDuration / 1000;
    const dps = this.damageDone / fightLengthSec;

    return {
      item: ITEMS.LUFFA_WRAPPINGS,
      result: (
        <span>
          {formatNumber(dps)} DPS
        </span>
      ),
    };
  }
}

export default LuffaWrappings;
