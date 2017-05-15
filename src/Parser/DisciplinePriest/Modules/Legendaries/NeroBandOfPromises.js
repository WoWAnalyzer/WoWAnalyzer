import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = true;

class NeroBandOfPromises extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasRing(ITEMS.NERO_BAND_OF_PROMISES.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ATONEMENT.id) {
      const combatant = this.owner.combatants.players[event.targetID];
      if (!combatant) {
        // If combatant doesn't exist it's probably a pet.
        debug && console.log('Skipping Atonement heal event since combatant couldn\'t be found:', event);
        return;
      }
      if (!combatant.hasBuff(SPELLS.POWER_WORD_BARRIER_BUFF.id, event.timestamp)) {
        // N'ero is only active when people are in the bubble
        return;
      }
      if (combatant.hasBuff(SPELLS.ATONEMENT.id, event.timestamp)) {
        // N'ero does NOT stack with pre-existing Atonement
        return;
      }

      this.healing += event.amount + (event.absorbed || 0);
    }
  }
}

export default NeroBandOfPromises;
