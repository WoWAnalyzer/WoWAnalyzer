import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class BeastCleave extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount;
  }

  subStatistic() {
    if (this.damage > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.BEAST_CLEAVE.id}>
              <SpellIcon id={SPELLS.BEAST_CLEAVE.id} noLink /> Beast Cleave
            </SpellLink>
          </div>
          <div className="flex-sub text-right">
            {(this.owner.formatItemDamageDone(this.damage))}
          </div>
        </div>
      );
    }
  }
}

export default BeastCleave;
