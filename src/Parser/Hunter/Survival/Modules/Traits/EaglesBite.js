import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';

/*
* Harpoon applies On the Trail, a unique damage over time effect that deals [ 360% of Attack Power ] damage over until cancelled. Your melee autoattacks extend its duration by 6 sec.
 */
class EaglesBite extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.EAGLES_BITE_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ON_THE_TRAIL_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EAGLES_BITE_TRAIT.id}>
            <SpellIcon id={SPELLS.EAGLES_BITE_TRAIT.id} noLink /> Eagle's Bite
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default EaglesBite;
