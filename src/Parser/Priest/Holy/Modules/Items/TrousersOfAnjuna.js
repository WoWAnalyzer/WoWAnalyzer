import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

class TrousersOfAnjuna extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _validAfterByPlayer = {};
  healing = 0;
  overhealing = 0;
  absorbed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasLegs(ITEMS.ENTRANCING_TROUSERS_OF_ANJUNA.id);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RENEW.id) {
      return;
    }

    this._validAfterByPlayer[event.targetID] = null;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RENEW.id) {
      return;
    }

    this._validAfterByPlayer[event.targetID] = event.timestamp + 15000;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RENEW.id) {
      return;
    }

    // Due to pandemic refreshing of Renew, must be sure not to overvalue the legendary by looking at strictly time + 15s
    // as a full pandemic refresh will give it 12 seconds over original 15s duration instead of normal 6.
    const intoPandemic = event.timestamp - this._validAfterByPlayer[event.targetID];
    if (intoPandemic > 0) {
      // If the buff is refreshed during the pandemic threshold (0-6s left), we need to make sure we don't accidentally cut ourselves short.
      // (i.e. look for 21-27s when the buff only lasted 24s after refresh).
      this._validAfterByPlayer[event.targetID] = event.timestamp + (event.timestamp - this._validAfterByPlayer[event.targetID]) + 15000;
    } else {
      // On the other hand, if the buff is refreshed before the pandemic point (more than 6s left) then timestamp - validAfter will yield a negative
      // number due to the effective portion of this item being the pandemic point. If this happens, we essentially need to hard set the limit to the
      // 21s mark due to the new buff lasting the pandemic max of 27.
      this._validAfterByPlayer[event.targetID] = event.timestamp + 21000;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RENEW.id) {
      return;
    }

    // Temporary logic just incase we have a situation where a heal registers before buff applications
    // (which I don't think occurs but just as a precautionary measure, this exists)
    if (!(event.targetID in this._validAfterByPlayer) || !this._validAfterByPlayer[event.targetID]) {
      return;
    }

    if (event.timestamp > this._validAfterByPlayer[event.targetID]) {
      this.healing += event.amount || 0;
      this.overhealing += event.overheal || 0;
      this.absorbed += event.absorbed || 0;
    }
  }

  item() {
    return {
      item: ITEMS.ENTRANCING_TROUSERS_OF_ANJUNA,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default TrousersOfAnjuna;
