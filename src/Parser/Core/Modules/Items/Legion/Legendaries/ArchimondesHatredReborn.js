import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import Abilities from 'Parser/Core/Modules/Abilities';

/**
 * Archimondes Hatred Reborn
 * Use: Gain an absorb shield for 30% of your maximum health for 10 sec. When the shield is consumed or expires, 75% of the damage absorbed is dealt to nearby enemies, split evenly.
 */
class ArchimondesHatredReborn extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  healing = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 75,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB.id) {
      this.healing += event.amount;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCHIMONDES_HATRED_REBORN_DAMAGE.id) {
      this.damage += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ARCHIMONDES_HATRED_REBORN,
      result: (
        <React.Fragment>
          <ItemHealingDone amount={this.healing} /><br />
          <ItemDamageDone amount={this.damage} />
        </React.Fragment>
      ),
    };
  }
}

export default ArchimondesHatredReborn;
