import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = true;

class NeroBandOfPromises extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFinger(ITEMS.NERO_BAND_OF_PROMISES.id);
    }
  }

  on_byPlayer_heal(event) {
    if (event.isAtonementHeal) {
      // N'ero appears in the log as regular Atonement healing
      const combatant = this.owner.combatants.players[event.targetID];
      if (!combatant) {
        // If combatant doesn't exist it's probably a pet, this shouldn't be noteworthy.
        debug && console.log('Skipping Atonement heal event since combatant couldn\'t be found:', event);
        return;
      }
      if (combatant.hasBuff(SPELLS.ATONEMENT_BUFF.id, event.timestamp)) {
        // If someone already has the Atonement buff then N'ero will not cause Penance to heal that person twice (N'ero does NOT stack with pre-existing Atonement)
        return;
      }
      if (this.owner.modules.atonementSource.atonementDamageSource.ability.guid !== SPELLS.PENANCE.id) {
        // N'ero only procs from Penance
        return;
      }

      this.healing += event.amount + (event.absorbed || 0);
    }
  }
}

export default NeroBandOfPromises;
