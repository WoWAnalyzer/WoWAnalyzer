import React from 'react';

import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';
import ItemDamageDone from 'Main/ItemDamageDone';
import Abilities from 'Parser/Core/Modules/Abilities';

/**
 * Archimondes Hatred Reborn
 * Use: Gain an absorb shield for 30% of your maximum health for 10 sec. When the shield is consumed or expires, 75% of the damage absorbed is dealt to nearby enemies, split evenly.
 */
class ArchimondesHatredReborn extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  healing = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id);

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
        <Wrapper>
          <ItemHealingDone amount={this.healing} /><br />
          <ItemDamageDone amount={this.damage} />
        </Wrapper>
      ),
    };
  }
}

export default ArchimondesHatredReborn;
