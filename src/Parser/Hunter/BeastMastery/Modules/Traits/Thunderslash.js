import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from 'common/SpellLink';

class Thunderslash extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.THUNDERSLASH_TRAIT.id];
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THUNDERSLASH_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.THUNDERSLASH_TRAIT.id}>
            <SpellIcon id={SPELLS.THUNDERSLASH_TRAIT.id} noLink /> Thunderslash
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {(this.owner.formatItemDamageDone(this.damage))}
        </div>
      </div>
    );
  }

}

export default Thunderslash;
