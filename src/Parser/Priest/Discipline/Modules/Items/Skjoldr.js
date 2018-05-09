import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Main/ItemHealingDone';

const debug = false;
const SKJOLDR_PWS_ABSORB_BONUS = 0.15;

// While working on this I found out something interesting; Share in the Light double dips from healing increases AND Versatility.
// Example log:
// 00:00:18.298    E gains Share in the Light from E (Remaining: 126734)
// 00:00:18.298    D gains Power Word: Shield from E (Remaining: 690861)
// Share in the Light is more than 15% here. It benefits from Will of the Conclave but that is only 10%, and 15% of 690,861 is 103,629, with 10% more it's only 113,992 - still not the 127k seen in the log. There's another 5% from the original paragon and it also double dips from Versatility. The player in the log had 2795 Versatility, making the calculation: `103629 * (1 + 2795 / 47500) * 1.1 * 1.05 = 126,734` which checks out.
// Thanks to Az and Lob in the Disc Discord for helping me figure this out.

class Skjoldr extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasWrists(ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id);
  }

  pwsByPlayerId = {};
  shareInTheLight = 0;
  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.POWER_WORD_SHIELD.id) {
      this.pwsByPlayerId[event.targetID] = (this.pwsByPlayerId[event.targetID] || 0) + event.amount;
    }
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.POWER_WORD_SHIELD.id) {
      if (!this.pwsByPlayerId[event.targetID]) {
        return;
      }

      const remaining = event.absorb;
      const originalAbsorb = this.pwsByPlayerId[event.targetID] + remaining;
      const skjoldrGain = originalAbsorb - originalAbsorb / (1 + SKJOLDR_PWS_ABSORB_BONUS);
      const effectiveHealing = Math.max(0, skjoldrGain - remaining);

      this.healing += effectiveHealing || 0;

      debug && console.log('Original absorb:', this.pwsByPlayerId[event.targetID], `(${remaining} remaining)`, `Gained ${effectiveHealing}`);

      this.pwsByPlayerId[event.targetID] = 0;
    }
  }

  item() {
    const healing = this.healing || 0;

    return {
      item: ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT,
      result: <ItemHealingDone amount={healing} />,
    };
  }
}

export default Skjoldr;
