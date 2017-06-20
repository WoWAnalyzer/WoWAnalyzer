import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class RenewingMist extends Module {
  remApplyTimestamp = null;
  remRemoveTimestamp = null;
  remCastTimestamp = null;
  dancingMistProc = 0;
  remTicks = 0;
  castsREM = 0;
  remCount = 0;
  dancingMistTarget = [];
  dancingMistHeal = 0;

  on_initialize() {
    if(!this.owner.error) {
      this.active = this.selectedCombatant.traitsBySpellId[SPELLS.DANCING_MISTS.id] === 1;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      // Buffer time added to account for the buff being removed and replicating to a new target.  Testing 100ms for now.
      debug && console.log('Last Applied Timestamp: ' + this.remApplyTimestamp + ' / Current Event Timestamp: ' + event.timestamp);
      if((event.timestamp - this.remRemoveTimestamp) <= 100 || this.remCastTimestamp === event.timestamp || this.remApplyTimestamp === event.timestamp) {
        debug && console.log('REM Applied Ok. Timestamp: ' + event.timestamp);
      } else {
        debug && console.log('REM Applied without Cast / Jump. Timestamp: ' + event.timestamp);
        debug && console.log('Target ID ' + event.targetID);
        this.dancingMistProc++;
        this.dancingMistTarget.push(event.targetID);
        debug && console.log('Dancing Mist Targets: ' + this.dancingMistTarget);
      }
      this.remApplyTimestamp = event.timestamp;
      this.remCount++;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    this.dancingMistTarget.forEach(targetID => {
      if(event.targetID === targetID) {
        debug && console.log('Dancing Mist REM Removed: ' + targetID);
        this.dancingMistTarget.splice(targetID, 1);
      }
    });

    if(spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      this.remRemoveTimestamp = event.timestamp;
      this.remCount--;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.RENEWING_MIST.id || spellId === SPELLS.LIFE_COCOON.id) {
      // Added because the buff application for REM can occur either before or after the cast.
      if(event.timestamp === this.remApplyTimestamp) {
        this.dancingMistProc--;
        debug && console.log('Dancing Mist Proc Removed / Timestamp: ' + event.timestamp);
      }
      this.castsREM++;
      this.remCastTimestamp = event.timestamp;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      this.remTicks++;

      this.dancingMistTarget.forEach(targetID => {
        if(event.targetID === targetID) {
          debug && console.log('Dancing Mist Heal on: ' + targetID);
          this.dancingMistHeal += event.amount;
          this.dancingMistHeal += event.absorbed || 0;
        }
      });

    }
  }


  on_finished() {
    if(debug) {
      console.log('Dancing Mist Procs: ' + this.dancingMistProc);
      console.log('REM Ticks: ' + this.remTicks);
      console.log('REM Casts: ' + this.castsREM);
      console.log('REM Count Out: ' + this.remCount);
      console.log('Dancing Mist Healing ' + this.dancingMistHeal);
    }
  }
}

export default RenewingMist;
