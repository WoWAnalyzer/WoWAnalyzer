import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';
import CoreHighfathersMachination from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/HighfathersMachination';
import ItemHealingDone from 'Main/ItemHealingDone';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class HighfathersMachination extends CoreHighfathersMachination {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  item() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.HIGHFATHERS_TIMEKEEPING_HEAL.id);

    return {
      item: ITEMS.HIGHFATHERS_MACHINATION,
      result: (
        <dfn data-tip={`You applied <b>${this.totalCharges}</b> healing charges.
        <ul>
          <li>Procced: <b>${this.proccedCharges}</b></li>
          <li>Expired: <b>${this.expiredCharges}</b></li>
          <li>Active at encounter's end: <b>${this.activeCharges}</b></li>
        </ul>
        Healing
        <ul>
          <li>${this.owner.formatItemHealingDone(this.healing)}</li>
        </ul>
        Feeding
        <ul>
          <li>${this.owner.formatItemHealingDone(feeding)}</li>
        </ul>
        `}>
          <ItemHealingDone amount={this.healing+feeding} />
        </dfn>
      ),
    };
  }
}

export default HighfathersMachination;
