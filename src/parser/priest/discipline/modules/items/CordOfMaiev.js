import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';

const debug = false;

const PENANCE_COOLDOWN = 9000; // unaffected by Haste

/** The amount of time during which it's impossible a second Penance could have started */
const PENANCE_CHANNEL_TIME_BUFFER = 2500;

class CordOfMaiev extends Analyzer {
  procs = 0;
  procTime = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWaist(ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON.id);
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

  item() {
    const procTimeSaved = (this.procTime / 1000).toFixed(1) || 0;
    const numProcs = this.procs || 0;

    return {
      item: ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON,
      result: (
        <>
          {procTimeSaved} seconds off the cooldown, {numProcs} Penances cast earlier
        </>
      ),
    };
  }
}

export default CordOfMaiev;
