import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import ROLES from 'common/ROLES';

class ManaValues extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }
  static SUGGESTION_MANA_BREAKPOINT = 0.1;

  lowestMana = null; // start at `null` and fill it with the first value to account for users starting at a non-default amount for whatever reason
  endingMana = 0;

  baseMana = 110000;
  manaUpdates = [];

  on_byPlayer_cast(event) {
    if (event.classResources) {
      event.classResources
        .filter(resource => resource.type === RESOURCE_TYPES.MANA)
        .forEach(({ amount, cost, max }) => {
          const manaValue = amount;
          const manaCost = cost || 0;
          const currentMana = manaValue - manaCost;
          this.endingMana = currentMana;

          if (this.lowestMana === null || currentMana < this.lowestMana) {
            this.lowestMana = currentMana;
          }
          this.manaUpdates.push({
            timestamp: event.timestamp,
            current: currentMana,
            max: max,
            used: manaCost,
          });
          // The variable 'max' is constant but can differentiate by racial/items.
          this.baseMana = max;
        });
    }
  }

  suggestions(when) {
    if(this.combatants.selected.spec.role !== ROLES.HEALER) {
      return;
    }
    const manaPercentageLeft = this.endingMana/this.baseMana;

    when(manaPercentageLeft).isGreaterThan(this.constructor.SUGGESTION_MANA_BREAKPOINT)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You ended the fight with too much mana. If possible, try to deplete all your mana when the boss dies. A good rule of thumb is having the same mana % as the bosses health %.
          Mana is indirectly tied with healing throughput and should be optimized. </span>)
          .icon('inv_elemental_mote_mana')
          .actual(`${formatPercentage(manaPercentageLeft)}% (${this.endingMana}) mana left`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1)
          .major(recommended + 0.2);
      });
  }
}

export default ManaValues;
