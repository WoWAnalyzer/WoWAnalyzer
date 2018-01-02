import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemManaGained from 'Main/ItemManaGained';
import ItemDamageDone from 'Main/ItemDamageDone';

class CarafeOfSearingLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  manaGained = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.CARAFE_OF_SEARING_LIGHT.id);
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
        <Wrapper>
          <ItemDamageDone amount={damage} /><br/>
          <ItemManaGained amount={manaGained} />
        </Wrapper>
      ),
    };
  }
}

export default CarafeOfSearingLight;
