import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from "common/SpellLink";
import PETS from 'common/PETS';
import CorePets from 'Parser/Core/Modules/Pets';
import ItemDamageDone from 'Main/ItemDamageDone';

const BLACK_ARROW_SUMMON = [
  PETS.BLACK_ARROW_MINION.id,
];

/**
 * Fires a Black Arrow at the target, dealing (520% of Attack power) Shadow damage over 8 sec and summoning a Dark Minion to taunt it for the duration.
 * When you kill an enemy, the remaining cooldown on Black Arrow will reset.
 */

class BlackArrow extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLACK_ARROW_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLACK_ARROW_TALENT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  //ensures that our other pet doesn't contribute damage to this if the player does not have the Lone Wolf talent selected
  on_byPlayerPet_damage(event) {
    const pet = this.pets.getSourceEntity(event);
    if (BLACK_ARROW_SUMMON.every(id => pet.guid !== id)) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.BLACK_ARROW_TALENT.id}>
            Black Arrow (+Pet)
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default BlackArrow;
