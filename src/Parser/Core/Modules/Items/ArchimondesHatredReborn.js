import React from 'react';

import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class ArchimondesHatredReborn extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB.id) {
      this.healing += event.amount;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCHIMONDES_HATRED_REBORN_DAMAGE.id) {
      this.damage += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ARCHIMONDES_HATRED_REBORN,
      result: (
        <Wrapper>
          {this.owner.formatItemHealingDone(this.healing)}<br />
          {this.owner.formatItemDamageDone(this.damage)}
        </Wrapper>
      ),
    };
  }
}

export default ArchimondesHatredReborn;
