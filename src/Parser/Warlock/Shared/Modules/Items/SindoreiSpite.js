import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const SINDOREI_SPITE_DAMAGE_BONUS = 0.15;

class SindoreiSpite extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.SINDOREI_SPITE.id);
  }

  on_byPlayerPet_damage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.SINDOREI_SPITE_BUFF.id, event.timestamp)) {
      this.bonusDmg += calculateEffectiveDamage(event, SINDOREI_SPITE_DAMAGE_BONUS);
    }
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SINDOREI_SPITE_BUFF.id, event.timestamp)) {
      return;
    }
    // so friendly TKC damage doesn't get counted
    if (!event.targetIsFriendly) {
      this.bonusDmg += calculateEffectiveDamage(event, SINDOREI_SPITE_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      item: ITEMS.SINDOREI_SPITE,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default SindoreiSpite;
