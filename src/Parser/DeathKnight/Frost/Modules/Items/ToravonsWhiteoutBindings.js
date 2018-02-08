import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SCHOOLS from 'common/MAGIC_SCHOOLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * While Pillar of Frost is active, you deal 15% increased Frost damage.
 */

const DAMAGE_MODIFIER = .15;

class ToravonsWhiteoutBindings extends Analyzer{
  static dependencies = {
    combatants: Combatants,
  }

  bonusDamage = 0;

  on_initialized(){
    this.active = this.combatants.selected.hasWrists(ITEMS.TORAVONS_WHITEOUT_BINDINGS.id);
  }

  on_byPlayer_damage(event){    
    if(event.ability.type !== SCHOOLS.ids.FROST) {
      return;
    }
    if(event.targetIsFriendly) {
      return;
    }
    if(this.combatants.selected.hasBuff(SPELLS.TORAVONS_WHITEOUT_BINDINGS.id)){
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
    }    
  }

  item() {
    return {
      item: ITEMS.TORAVONS_WHITEOUT_BINDINGS,
      result: <ItemDamageDone amount={this.bonusDamage} />,
    };
  }
}

export default ToravonsWhiteoutBindings;