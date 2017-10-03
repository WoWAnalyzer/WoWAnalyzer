import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const SACROLASH_DAMAGE_BONUS = 0.15;

class SacrolashsDarkStrike extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SACROLASHS_DARK_STRIKE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CORRUPTION_DEBUFF.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, SACROLASH_DAMAGE_BONUS);
  }

  item() {
    return {
      item: ITEMS.SACROLASHS_DARK_STRIKE,
      result: (
        <dfn data-tip={`Total bonus damage contributed: ${formatNumber(this.bonusDmg)}`}>
          {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default SacrolashsDarkStrike;
