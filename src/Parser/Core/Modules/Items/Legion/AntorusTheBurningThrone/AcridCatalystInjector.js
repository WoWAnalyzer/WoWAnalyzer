import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
* Acrid Catalyst Injector -
* Equip:  Your damaging spells that critically strike have a chance to increase your Haste, Mastery, or Critical Strike by 92 for 45 sec, stacking up to 5 times. When any stack reaches 5, all effects are consumed to grant you 2,183 of all three attributes for 12 sec.
*/
class AcridCatalystInjector extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  oneStatBuff = 0;
  threeStatBuff = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ACRID_CATALYST_INJECTOR.id);
    if (this.active) {
      this.threeStatBuff = calculateSecondaryStatDefault(930, 2183, this.combatants.selected.getItem(ITEMS.ACRID_CATALYST_INJECTOR.id).itemLevel);
      this.oneStatBuff = calculateSecondaryStatDefault(930, 92, this.combatants.selected.getItem(ITEMS.ACRID_CATALYST_INJECTOR.id).itemLevel);
    }
  }

  averageStatGain(spellId) {
    const averageStacks = this.combatants.selected.getStackWeightedBuffUptime(spellId) / this.owner.fightDuration;
    const cycleUptime = this.combatants.selected.getBuffUptime(SPELLS.CYCLE_OF_THE_LEGION.id) / this.owner.fightDuration;

    return averageStacks * this.oneStatBuff + cycleUptime * this.threeStatBuff;
  }

  item() {
    this.averageStatGain();
    return {
      item: ITEMS.ACRID_CATALYST_INJECTOR,
      result: (
        <dfn data-tip="Stat values is the gain from each proc and the Cycle of the Legion proc averaged over the fight duration.">
          <ul>
            <li>{formatNumber(this.averageStatGain(SPELLS.BRUTALITY_OF_THE_LEGION.id))} average crit</li>
            <li>{formatNumber(this.averageStatGain(SPELLS.FERVOR_OF_THE_LEGION.id))} average haste</li>
            <li>{formatNumber(this.averageStatGain(SPELLS.MALICE_OF_THE_LEGION.id))} average mastery</li>
          </ul>
        </dfn>
      ),
    };
  }
}

export default AcridCatalystInjector;
