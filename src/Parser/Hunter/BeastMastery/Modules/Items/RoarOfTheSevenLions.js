import React from 'react';

import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

/*
 * Roar of the Seven Lions
 * Equip: Bestial Wrath reduces the Focus cost of all your abilities by 15%.
 */
const LIST_OF_FOCUS_SPENDERS = [
  SPELLS.COBRA_SHOT.id,
  SPELLS.MULTISHOT.id,
  SPELLS.KILL_COMMAND.id,
  SPELLS.REVIVE_PET_AND_MEND_PET.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.VOLLEY_ACTIVATED.id,
];

const VOLLEY_COST = 3;

const FOCUS_COST_REDUCTION = 0.15;

class RoarOfTheSevenLions extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  focusSaved = 0;
  lastFocusCost = 0;
  focusCostCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.ROAR_OF_THE_SEVEN_LIONS.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (LIST_OF_FOCUS_SPENDERS.every(id => spellId !== id)) {
      return;
    }
    this.lastFocusCost = event.classResources[0]['cost'] || 0;
    this.focusSaved += this.lastFocusCost * FOCUS_COST_REDUCTION;
    this.focusCostCasts += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLLEY_ACTIVATED.id) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    this.focusSaved += VOLLEY_COST * FOCUS_COST_REDUCTION;
    this.focusCostCasts += 1;
  }

  item() {
    const averageFocusCostReduction = this.focusSaved / this.focusCostCasts;
    return {
      item: ITEMS.ROAR_OF_THE_SEVEN_LIONS,
      result: (
        <dfn data-tip={`This saved you an average of ${averageFocusCostReduction.toFixed(2)} focus per cast affected by this legendary.`}>
          saved you a total of {formatNumber(this.focusSaved)} focus.
        </dfn>
      ),
    };
  }
}

export default RoarOfTheSevenLions;
