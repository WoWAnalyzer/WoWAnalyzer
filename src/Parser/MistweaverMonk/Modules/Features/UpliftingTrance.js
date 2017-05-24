// Based on Clearcasting Implementation done by @Blazyb

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const UT_DURATION = 20000;
const debug = false;

class UpliftingTrance extends Module {

  UTProcsTotal = 0;
  lastUTProcTime = 0;
  consumedUTProc = 0;
  overwrittenUTProc = 0;
  nonUTVivify = 0;


  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.UPLIFTING_TRANCE_BUFF.id !== spellId) {
      return;
    }

    this.lastUTProcTime = event.timestamp;
    debug && console.log('UT Proc Applied');
    this.UTProcsTotal++;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.UPLIFTING_TRANCE_BUFF.id !== spellId) {
      return;
    }

    // Captured Overwritten UT Buffs for use in wasted buff calculations
    this.lastUTProcTime = event.timestamp;
    debug && console.log('UT Proc Overwritten');
    this.UTProcsTotal++;
    this.overwrittenUTProc++;

  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.VIVIFY.id !== spellId) {
      return;
    }

    if (event.tick) {
      return;
    }

    // Checking to see if non-UT'ed Viv is casted
    if(this.lastUTProcTime !== event.timestamp) {
      if(this.lastUTProcTime === null) {
        // No UT Proc with Vivify
        this.nonUTVivify++;
        return;
      }
      let utTimeframe = this.lastUTProcTime + UT_DURATION;
      if(event.timestamp > utTimeframe) {
        this.nonUTVivify++;
      } else {
        this.consumedUTProc++;
        this.lastUTProcTime = null;
      }
    }
  }
}

export default UpliftingTrance;
