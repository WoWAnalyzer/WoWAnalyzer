import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemManaGained from 'Main/ItemManaGained';
import ItemDamageDone from 'Main/ItemDamageDone';
import Abilities from 'Parser/Core/Modules/Abilities';

class CarafeOfSearingLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  damage = 0;
  manaGained = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.CARAFE_OF_SEARING_LIGHT.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.REFRESHING_AGONY_DOT,
        name: ITEMS.CARAFE_OF_SEARING_LIGHT.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REFRESHING_AGONY_DOT.id) {
      return;
    }

    this.damage += event.amount;
  }
  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REFRESHING_AGONY_MANA.id) {
      return;
    }

    this.manaGained += event.resourceChange;
  }

  item() {
    const damage = this.damage || 0;
    const manaGained = this.manaGained || 0;

    return {
      item: ITEMS.CARAFE_OF_SEARING_LIGHT,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={damage} /><br/>
          <ItemManaGained amount={manaGained} />
        </React.Fragment>
      ),
    };
  }
}

export default CarafeOfSearingLight;
