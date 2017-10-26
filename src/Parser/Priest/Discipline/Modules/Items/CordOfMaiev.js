import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';

const debug = true;

const PENANCE_COOLDOWN = 9000; // unaffected by Haste

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

class CordOfMaiev extends Analyzer {
  procs = 0;
  procTime = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasWaist(ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON.id);
  }

  lastPenanceStartTimestamp = null;
  canHaveProcced = false;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PENANCE.id) {
      // TODO: T20 4 set: Power Word: Shield has a 25% chance to cause your next Penance to be free and have 50% reduced cooldown.
      if (this.canHaveProcced && (event.timestamp - this.lastPenanceStartTimestamp) < PENANCE_COOLDOWN) {
        debug && console.log('%cCord of Maiev proc', 'color:green', event.timestamp, this.lastPenanceStartTimestamp, event.timestamp - this.lastPenanceStartTimestamp);
        this.procs += 1;
        this.procTime += PENANCE_COOLDOWN - (event.timestamp - this.lastPenanceStartTimestamp);
      }
      this.canHaveProcced = false;
      if (!this.lastPenanceStartTimestamp || (event.timestamp - this.lastPenanceStartTimestamp) > PENANCE_CHANNEL_TIME_BUFFER) {
        this.lastPenanceStartTimestamp = event.timestamp;
      }
    } else if (spellId === SPELLS.SMITE.id) {
      this.canHaveProcced = true;
    }
  }
}

export default CordOfMaiev;
