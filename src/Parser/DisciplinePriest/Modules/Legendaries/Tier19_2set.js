import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const debug = false;

const HEALING_INCREASE = 0.3;

class Tier19_2set extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    const combatant = this.owner.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping event since combatant couldn\'t be found:', event);
      return;
    }
    const hasBuff = combatant.hasBuff(SPELLS.POWER_WORD_SHIELD.id, event.timestamp);
    if (!hasBuff) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, HEALING_INCREASE);
  }
}

export default Tier19_2set;
