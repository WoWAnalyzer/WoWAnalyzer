import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'Main/ItemDamageDone';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const SACROLASH_DAMAGE_BONUS = 0.15;

class SacrolashsDarkStrike extends Analyzer {
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
    this.bonusDmg += calculateEffectiveDamage(event, SACROLASH_DAMAGE_BONUS);
  }

  item() {
    return {
      item: ITEMS.SACROLASHS_DARK_STRIKE,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default SacrolashsDarkStrike;
