import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, BEACON_TRANSFER_SPELL_ID } from 'Main/Parser/Constants';
import calculateEffectiveHealing from 'Main/Parser/calculateEffectiveHealing';

const debug = true;

export const SACRED_DAWN_TRAIT_ID = 238132;
const SACRED_DAWN_BUFF_SPELL_ID = 243174;
const SACRED_DAWN_HEALING_INCREASE = 0.1;

class SacredDawn extends Module {
  healing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    if (spellId === BEACON_TRANSFER_SPELL_ID) {
      // Beacon transfer doesn't double dip, so it relies on the buff having been applied to original heal target so we need `on_beacon_heal` to calculate this. (so if a beacon target gets 10% increased healing from SD it won't increase the received beacon heals except indirectly).
      return;
    }
    const combatant = this.owner.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping event since combatant couldn\'t be found:', event);
      return;
    }
    if (!combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, SACRED_DAWN_HEALING_INCREASE);
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal: healEvent }) {
    const spellId = healEvent.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    const combatant = this.owner.combatants.players[healEvent.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping beacon heal event since combatant couldn\'t be found:', beaconTransferEvent, 'for heal:', healEvent);
      return;
    }
    if (!combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID)) {
      return;
    }

    this.healing += calculateEffectiveHealing(beaconTransferEvent, SACRED_DAWN_HEALING_INCREASE);
  }
}

export default SacredDawn;
