import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import isAtonement from './../Core/isAtonement';

const debug = true;

class TarnishedSentinelMedallion extends Module {
  healing = 0;
  damage = 0;
  damageAbilities = new Set([SPELLS.SPECTRAL_BOLT.id, SPELLS.SPECTRAL_BLAST.id]);

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id);
  }

  on_byPlayer_heal(event) {
    if (isAtonement(event)) {
      const combatant = this.owner.combatants.players[event.targetID];
      if (!combatant) {
        // If combatant oesn't exist it's probably a pet, this shouldn't be noteworthy.
        debug && console.log('Skipping Atonement heal event since combatant couldn\'t be found:', event);
        return;
      }
      if (!this.damageAbilities.has(this.owner.modules.atonementSource.atonementDamageSource.ability.guid)) {
        return;
      }
      
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.damageAbilities.has(spellId)) {
      return;
    }

    this.damage += event.amount;
  }
}

export default TarnishedSentinelMedallion;
