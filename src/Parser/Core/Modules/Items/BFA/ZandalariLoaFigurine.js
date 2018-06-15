import React from "react";

import SPELLS from "common/SPELLS";
import ITEMS from "common/ITEMS";
import Analyzer from "Parser/Core/Analyzer";
import Combatants from "Parser/Core/Modules/Combatants";
import { formatPercentage } from 'common/format';

/**
 * Zandalari Loa Figurine -
 * Equip: Your spells and abilities have a chance to increase your primary stat by 814 for 10 sec.
 */
class ZandalariLoaFigurine extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(
      ITEMS.ZANDALARI_LOA_FIGURINE.id
    );
  }

  get buffTriggerCount() {
    return this.combatants.selected.getBuffTriggerCount(SPELLS.WILL_OF_THE_LOA.id);
  }

  get totalBuffUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.WILL_OF_THE_LOA.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.ZANDALARI_LOA_FIGURINE,
      result: (
        <dfn data-tip={`Procced ${this.buffTriggerCount} times`}>
          {formatPercentage(this.totalBuffUptime)}% uptime
        </dfn>
      ),
    };
  }
}

export default ZandalariLoaFigurine;
