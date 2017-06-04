import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = true;

class NeroBandOfPromises extends Module {
  healing = 0;
  barrierActive = false;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasRing(ITEMS.NERO_BAND_OF_PROMISES.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ATONEMENT_HEAL_NON_CRIT.id || spellId === SPELLS.ATONEMENT_HEAL_CRIT.id) {
      const combatant = this.owner.combatants.players[event.targetID];
      if (!combatant) {
        // If combatant doesn't exist it's probably a pet.
        debug && console.log('Skipping Atonement heal event since combatant couldn\'t be found:', event);
        return;
      }
      if (combatant.hasBuff(SPELLS.ATONEMENT_BUFF.id, event.timestamp)) {
        // N'ero does NOT stack with pre-existing Atonement
        return;
      }
      if (this.owner.modules.atonementDamageSource.spell.guid !== SPELLS.PENANCE.id) {
        // N'ero only procs from Penance
        return;
      }

      this.healing += event.amount + (event.absorbed || 0);
    }
  }
}

export default NeroBandOfPromises;
