import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * After you Multi-Shot, your pet's melee attacks also strike all other nearby enemy targets for 100% as much for the next 4 sec.
 */
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
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    if (this.damage > 0) {
      // TODO: Remove this if-statement since rendering should be consistent regardless of cast count OR document why this is an exception
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.BEAST_CLEAVE.id} />
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.damage} />
          </div>
        </div>
      );
    }
    return null;
  }
}

export default BeastCleave;
