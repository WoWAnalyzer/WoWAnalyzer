import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const debug = false;
const GUIDING_HAND_DURATION = 120000;
const PROC_EVENT_START_BUFFER = 5000;
const PROC_EVENT_END_BUFFER = 1000;

class DecieversGrandDesign extends Module {
  healing = 0;
  healingAbsorb = 0;
  dgdTargetOne = null;
  gdgDownTimeTargetOne = 0;
  dgdProcTimestampTargetOne = null;
  gdgDownTimeTargetTwo = 0;
  dgdTargetTwo = null;
  dgdProcTimestampTargetTwo = null;
  dgdProced = false;

  dgdProcs = [];

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.GUIDING_HAND.id) {
      this.healing += event.amount || 0;
      this.healing += event.absorbed || 0;

      // Account for precasting
      if(this.dgdTargetOne === event.targetID || this.dgdTargetTwo === event.targetID) {
        return;
      } else {
        if(!this.dgdTargetOne) {
          this.dgdTargetOne = event.targetID;
        } else {
          this.dgdTargetTwo = event.targetID;
        }
      }
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
      this.healingAbsorb += event.amount || 0;
      this.healingAbsorb += event.absorbed || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.GUIDING_HAND.id) {
      if(this.dgdTargetOne === null) {
        this.dgdTargetOne = event.targetID;
        debug && console.log('Target One: ' + this.dgdTargetOne);
      } else if(this.dgdTargetTwo === null) {
        this.dgdTargetTwo = event.targetID;
        debug && console.log('Target Two: ' + this.dgdTargetTwo);
      } else {
        debug && console.log('Logic Error?!');
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if(spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
        this.dgdProced = true;
        const startTime = event.timestamp - PROC_EVENT_START_BUFFER;
        const endTime = event.timestamp + PROC_EVENT_END_BUFFER;
        if(targetId === this.dgdTargetOne) {
          this.dgdTargetOne = null;
          this.dgdProcTimestampTargetOne = event.timestamp;
        } else if(targetId === this.dgdTargetTwo) {
          this.dgdTargetTwo = null;
          this.dgdProcTimestampTargetTwo = event.timestamp;
        }
        const urlText = `<a href=https://www.warcraftlogs.com/reports/` + this.owner.report.code + `#fight=` + this.owner.fight.id + `&source=` + targetId + `&type=summary&start=` + startTime + `&end=` + endTime + `&view=events> Player: ` + this.owner.combatants.players[targetId]._combatantInfo.name + `<br />`;
        console.log('URL Text', urlText);
        this.dgdProcs.push({
          name: this.owner.combatants.players[targetId]._combatantInfo.name,
          report: this.owner.report.code,
          fight: this.owner.fight.id,
          target: targetId,
          start: startTime,
          end: endTime,
          text: urlText,
        });
        debug && console.log(this.dgdProcs);
        debug && console.log('https://www.warcraftlogs.com/reports/' + this.owner.report.code + '/#fight=' + this.owner.fight.id + '&source=' + this.dgdProcs[0].target + '&type=summary&start=' + this.dgdProcs[0].start + '&end=' + this.dgdProcs[0].end + '&view=events');
    }
  }

  on_finished() {
    if(debug) {
      console.log('Proc Checks: ', this.dgdProcs);
      console.log('Healing: ' + this.healing);
      console.log('Absorbed: ' + this.healingAbsorb);
      console.log('Report Code: ' + this.owner.report.code);
    }
  }

}

export default DecieversGrandDesign;
