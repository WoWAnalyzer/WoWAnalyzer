// Based on Clearcasting Implementation done by @Blazyb

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const GG_DURATION = 10000;
const debug = false;

class GalacticGuardian extends Module {

  GGProcsTotal = 0;
  lastGGProcTime = 0;
  consumedGGProc = 0;
  overwrittenGGProc = 0;
  nonGGMoonFire = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.GALACTIC_GUARDIAN_TALENT.id);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GALACTIC_GUARDIAN.id === spellId) {
      this.lastGGProcTime = event.timestamp;
      debug && console.log('Galactic Guardian applied');
      this.GGProcsTotal++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GALACTIC_GUARDIAN.id === spellId) {
      // Captured Overwritten GG Buffs for use in wasted buff calculations
      this.lastGGProcTime = event.timestamp;
      debug && console.log('Galactic Guardian Overwritten');
      this.GGProcsTotal++;
      this.overwrittenGGProc++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MOONFIRE.id !== spellId) {
      return;
    }
    if(this.lastGGProcTime !== event.timestamp) {
      if(this.lastGGProcTime === null) {
        this.nonGGMoonFire++;
        return;
      }
      const GGTimeframe = this.lastGGProcTime + GG_DURATION;
      if(event.timestamp > GGTimeframe) {
        this.nonGGMoonFire++;
      } else {
        this.consumedGGProc++;
        debug && console.log('Galactic Guardian Proc Consumed / Timestamp: ' + event.timestamp);
        this.lastGGProcTime = null;
      }
    }
  }
}

export default GalacticGuardian;
