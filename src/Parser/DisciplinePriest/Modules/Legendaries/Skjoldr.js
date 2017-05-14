import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = false;
const SKJOLDR_PWS_ABSORB_BONUS = 0.15;

class Skjoldr extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasWrists(ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id);
    }
  }

  pwsByPlayerId = {};
  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_SHIELD.id) {
      return;
    }

    this.pwsByPlayerId[event.targetID] = (this.pwsByPlayerId[event.targetID] || 0) + event.amount;
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_SHIELD.id) {
      return;
    }
    if (!this.pwsByPlayerId[event.targetID]) {
      return;
    }

    const remaining = event.absorb;
    const originalAbsorb = this.pwsByPlayerId[event.targetID] + remaining;
    const skjoldrGain = originalAbsorb - originalAbsorb / (1 + SKJOLDR_PWS_ABSORB_BONUS);
    const effectiveHealing = Math.max(0, skjoldrGain - remaining);

    this.healing += effectiveHealing;

    debug && console.log('Original absorb:', this.pwsByPlayerId[event.targetID], `(${remaining} remaining)`, `Gained ${effectiveHealing}`);

    this.pwsByPlayerId[event.targetID] = 0;
  }
}

export default Skjoldr;
