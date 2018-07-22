import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const SACROLASH_DAMAGE_BONUS = 0.15;

class SacrolashsDarkStrike extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SACROLASHS_DARK_STRIKE.id);
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
