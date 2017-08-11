// Based on Clearcasting Implementation done by @Blazyb

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const GORE_DURATION = 10000;
const debug = false;

class Gore extends Module {

  GoreProcsTotal = 0;
  lastGoreProcTime = 0;
  consumedGoreProc = 0;
  overwrittenGoreProc = 0;
  nonGoreMangle = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GORE_BEAR.id === spellId) {
      this.lastGoreProcTime = event.timestamp;
      debug && console.log('Gore applied');
      this.GoreProcsTotal++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GORE_BEAR.id === spellId) {
      // Captured Overwritten Gore Buffs for use in wasted buff calculations
      this.lastGoreProcTime = event.timestamp;
      debug && console.log('Gore Overwritten');
      this.GoreProcsTotal++;
      this.overwrittenGoreProc++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MANGLE_BEAR.id !== spellId) {
      return;
    }
    if(this.lastGoreProcTime !== event.timestamp) {
      if(this.lastGoreProcTime === null) {
        this.nonGoreMangle++;
        return;
      }
      const goreTimeframe = this.lastGoreProcTime + GORE_DURATION;
      if(event.timestamp > goreTimeframe) {
        this.nonGoreMangle++;
      } else {
        this.consumedGoreProc++;
        debug && console.log('Gore Proc Consumed / Timestamp: ' + event.timestamp);
        this.lastGoreProcTime = null;
      }
    }
  }
}

export default Gore;
