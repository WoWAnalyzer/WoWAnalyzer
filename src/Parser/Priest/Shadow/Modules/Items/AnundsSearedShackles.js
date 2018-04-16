import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const DAMAGE_INCREASE_PER_STACK = 0.03;

class AnundsSearedShackles extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;
  buffStacksSinceLastCast = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.ANUNDS_SEARED_SHACKLES.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.VOID_BOLT.id) {
      this.bonusDmg += calculateEffectiveDamage(event, (this.buffStacksSinceLastCast * DAMAGE_INCREASE_PER_STACK));
      this.buffStacksSinceLastCast = 0;
    }
  }

  on_byPlayer_applybuff(event) {
    this.addStack(event);
  }

  on_byPlayer_applybuffstack(event) {
    this.addStack(event);
  }

  addStack(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.ANUNDS_SEARED_SHACKLES_BUFF.id) {
      this.buffStacksSinceLastCast += 1;
    }
  }

  item() {
    return {
      item: ITEMS.ANUNDS_SEARED_SHACKLES,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default AnundsSearedShackles;
