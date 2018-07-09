import React from 'react';

import SPELLS from "common/SPELLS";
import ITEMS from "common/ITEMS";
import Analyzer from "Parser/Core/Analyzer";
import { formatPercentage } from 'common/format';

/**
 * Gilded Loa Figurine -
 * Equip: Your spells and abilities have a chance to increase your primary stat by 814 for 10 sec.
 */
class GildedLoaFigurine extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.GILDED_LOA_FIGURINE.id);
  }

  get buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.WILL_OF_THE_LOA.id);
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WILL_OF_THE_LOA.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.GILDED_LOA_FIGURINE,
      result: (
        <dfn data-tip={`Procced ${this.buffTriggerCount} times`}>
          {formatPercentage(this.totalBuffUptime)}% uptime
        </dfn>
      ),
    };
  }
}

export default GildedLoaFigurine;
