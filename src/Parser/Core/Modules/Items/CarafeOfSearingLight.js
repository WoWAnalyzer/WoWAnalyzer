import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatThousands } from 'common/format';

import Combatants from "../Combatants";
import Analyzer from "../../Analyzer";

class CarafeOfSearingLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  manaGained = 0;

  on_initialized() {
    const selectedCombatant = this.combatants.selected;
    this.active = selectedCombatant.hasTrinket(ITEMS.CARAFE_OF_SEARING_LIGHT.id);
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.REFRESHING_AGONY_MANA.id) {
      this.manaGained += event.resourceChange;
    }
  }

  item() {
    return {
      item: ITEMS.CARAFE_OF_SEARING_LIGHT,
      result: (
        <dfn data-tip="The exact amount of mana saved by the Carafe of Searing Light effect.">
          {formatThousands(this.manaGained)} mana saved ({formatThousands(this.manaGained / this.owner.fightDuration * 1000 * 5)} MP5)
        </dfn>
      ),
    };
  }
}

export default CarafeOfSearingLight;
