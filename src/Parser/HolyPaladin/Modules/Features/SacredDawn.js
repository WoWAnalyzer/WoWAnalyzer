import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, BEACON_TRANSFER_SPELL_ID } from '../../Constants';

const debug = false;

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
    // When SD isn't up, a Light of Dawn applies Sacred Dawn to the players. Until 18/4/17 this sometimes happened BEFORE the heal was triggered, but the buff didn't increase the healing. While this should no longer happen, the below `minimalActiveTime` of 5ms should make sure that if it does still happen, the non existing healing gain isn't considered.
    const hasBuff = combatant.hasBuff(SACRED_DAWN_BUFF_SPELL_ID, event.timestamp, undefined, 5);

    if (debug && spellId === SPELLS.LIGHT_OF_DAWN_HEAL.id) {
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
