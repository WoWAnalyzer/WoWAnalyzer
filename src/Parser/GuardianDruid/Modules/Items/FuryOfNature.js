import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'common/MAGIC_SCHOOLS';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';

const FURY_OF_NATURE_DAMAGE_MODIFIER = 0.3;

class FuryOfNature extends Module {
  damageDone = 0;
  on_initialized() {
    this.active = this.owner.selectedCombatant.hasBack(ITEMS.FURY_OF_NATURE.id);
  }

  on_byPlayer_damage(event) {
    if (this.owner.selectedCombatant.hasBuff(SPELLS.BEAR_FORM.id) && (event.ability.type === MAGIC_SCHOOLS.ids.NATURE || event.ability.type === MAGIC_SCHOOLS.ids.ARCANE)) {
      // Isolate the damage contribution of the legendary
      this.damageDone += (event.amount + event.absorbed) * FURY_OF_NATURE_DAMAGE_MODIFIER / (1 + FURY_OF_NATURE_DAMAGE_MODIFIER);
    }
  }

  item() {
    const fightLengthSec = this.owner.fightDuration / 1000;
    const dps = this.damageDone / fightLengthSec;
    const hps = this.owner.modules.abilityTracker.getAbility(SPELLS.FURY_OF_NATURE_HEAL.id).healingEffective / fightLengthSec;

    return {
      item: ITEMS.FURY_OF_NATURE,
      result: (
        <span>
          {formatNumber(dps)} DPS / {formatNumber(hps)} HPS
        </span>
      ),
    };
  }
}

export default FuryOfNature;
