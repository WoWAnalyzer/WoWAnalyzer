import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import isAtonement from '../Core/isAtonement';
import AtonementSource from '../Features/AtonementSource';

const debug = true;

class MarchOfTheLegion extends Module {
  static dependencies = {
    combatants: Combatants,
    atonementSource: AtonementSource,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.RING_OF_LOOMING_MENACE.id) && this.combatants.selected.hasNeck(ITEMS.CHAIN_OF_SCORCHED_BONES.id);
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet, this shouldn't be noteworthy.
      debug && console.log('Skipping Atonement heal event since combatant couldn\'t be found:', event);
      return;
    }
    if (this.atonementSource.atonementDamageSource.ability.guid !== SPELLS.MARCH_OF_THE_LEGION.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }
}

export default MarchOfTheLegion;
