// Based on Clearcasting Implementation done by @Blazyb

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const GoE_DURATION = 15000;
const debug = false;

class GuardianOfElune extends Module {

  GoEProcsTotal = 0;
  lastGoEProcTime = 0;
  consumedGoEProc = 0;
  overwrittenGoEProc = 0;
  nonGoEIronFur = 0;
  GoEIronFur = 0;
  nonGoEFRegen = 0;
  GoEFRegen = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GUARDIAN_OF_ELUNE.id === spellId) {
      this.lastGoEProcTime = event.timestamp;
      debug && console.log('Guardian of Elune applied');
      this.GoEProcsTotal++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GUARDIAN_OF_ELUNE.id === spellId) {
      // Captured Overwritten GoE Buffs for use in wasted buff calculations
      this.lastGoEProcTime = event.timestamp;
      debug && console.log('Guardian of Elune Overwritten');
      this.GoEProcsTotal++;
      this.overwrittenGoEProc++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONFUR.id !== spellId && SPELLS.FRENZIED_REGENERATION.id !== spellId) {
      return;
    }
    if (SPELLS.IRONFUR.id === spellId)
    {
      if(this.lastGoEProcTime !== event.timestamp) {
        if(this.lastGoEProcTime === null) {
          this.nonGoEIronFur++;
          return;
        }
        const GoETimeframe = this.lastGoEProcTime + GoE_DURATION;
        if(event.timestamp > GoETimeframe) {
          this.nonGoEIronFur++;
        } else {
          this.consumedGoEProc++;
          this.GoEIronFur++;
          debug && console.log('Guardian of Elune Proc Consumed / Timestamp: ' + event.timestamp);
          this.lastGoEProcTime = null;
        }
      }
    }
    if (SPELLS.FRENZIED_REGENERATION.id === spellId)
    {
      if(this.lastGoEProcTime !== event.timestamp) {
        if(this.lastGoEProcTime === null) {
          this.nonGoEFRegen++;
          return;
        }
        const GoETimeframe = this.lastGoEProcTime + GoE_DURATION;
        if(event.timestamp > GoETimeframe) {
          this.nonGoEFRegen++;
        } else {
          this.consumedGoEProc++;
          this.GoEFRegen++;
          debug && console.log('Guardian of Elune Proc Consumed / Timestamp: ' + event.timestamp);
          this.lastGoEProcTime = null;
        }
      }
    }
  }
}

export default GuardianOfElune;
