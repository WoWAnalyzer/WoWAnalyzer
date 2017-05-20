import SPELLS from 'common/SPELLS';

import CoreDarkmoonDeckPromises from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';

const debug = false;

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

class DarkmoonDeckPromises extends CoreDarkmoonDeckPromises {
  lastPenanceStartTimestamp = null;
  getManaCost(event) {
    const spellId = event.ability.guid;
    let cost = super.getManaCost(event);

    if (this.owner.selectedCombatant.hasBuff(SPELLS.INNERVATE_BUFF.id, event.timestamp)) {
      return 0;
    }

    // Penance does not include the mana cost in the combatlog :(
    if (spellId === SPELLS.PENANCE.id) {
      if (!this.lastPenanceStartTimestamp || (event.timestamp - this.lastPenanceStartTimestamp) > PENANCE_CHANNEL_TIME_BUFFER) {
        this.lastPenanceStartTimestamp = event.timestamp;
        cost = SPELLS.PENANCE.manaCost;
      } else {
        // This is a second bolt from Penance, it doesn't cost mana.
        cost = 0;
      }
    }

    // Kam Xi'raff reduces the mana cost of damaging spells by 75%
    if (!event.targetIsFriendly && this.owner.selectedCombatant.hasBuff(SPELLS.KAM_XIRAFF_BUFF.id, event.timestamp)) {
      debug && console.log('Hostile spell and', SPELLS.KAM_XIRAFF_BUFF.name, 'is active, reducing cost (', cost, ') by 75%');
      cost *= 0.25;
    }

    return cost;
  }
}

export default DarkmoonDeckPromises;
