import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreArchiveOfFaith from 'Parser/Core/Modules/Items/Legion/TombOfSargeras/ArchiveOfFaith';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';
import Abilities from 'Parser/Core/Modules/Abilities';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class ArchiveOfFaith extends CoreArchiveOfFaith {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  item() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.CLEANSING_MATRIX.id);

    return {
      item: ITEMS.ARCHIVE_OF_FAITH,
      result: (
        <dfn data-tip={`Healing breakdown:
          <ul>
            <li>Channel: ${this.owner.formatItemHealingDone(this.healingChannel)}</li>
            <li>Feeding: ${this.owner.formatItemHealingDone(feeding)}</li>
            <li>Absorb: ${this.owner.formatItemHealingDone(this.healingAbsorb)}</li>
          </ul>
        `}>
          <ItemHealingDone amount={this.healingTotal+feeding} />
        </dfn>
      ),
    };
  }
}

export default ArchiveOfFaith;
