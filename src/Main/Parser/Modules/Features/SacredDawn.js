import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, BEACON_TRANSFER_SPELL_ID, LIGHT_OF_DAWN_HEAL_SPELL_ID } from 'Main/Parser/Constants';
import calculateEffectiveHealing from 'Main/Parser/calculateEffectiveHealing';

const debug = false;

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
    // When SD isn't up, a Light of Dawn applies Sacred Dawn to the players. This happens BEFORE the heal is logged, but the buff (for some weird reason) only applies the increased healing effect to the Light of Dawn healing on yourself. Other players get healed by Light of Dawn as if Sacred Dawn wasn't on them. This code makes it so the Paladin gets the effect from a fresh SD, while other players do not (as happens in-game).
    const isPlayer = event.targetID === this.owner.playerId;
    const hasBuff = combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID, event.timestamp, undefined, isPlayer ? 0 : 5);

    if (debug && spellId === LIGHT_OF_DAWN_HEAL_SPELL_ID) {
      const secondsIntoFight = (event.timestamp - this.owner.fight.start_time) / 1000;
      console.log(secondsIntoFight.toFixed(3), event.timestamp, 'LoD heal on', combatant.name, 'Sacred Dawn:', hasBuff, 'event:', event);
    }

    if (!hasBuff) {
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
    if (!combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID, healEvent.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(beaconTransferEvent, SACRED_DAWN_HEALING_INCREASE);
  }
}

export default SacredDawn;
