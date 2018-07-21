import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

const debug = false;
const DOORWAYACTIVETIME = 15000;
const CHIJIACTIVETIME = 45000;

class DoorwayToNowhere extends Analyzer {
  healing = 0;
  healingOverlap = 0;
  doorwayActive = 0;
  doorwayProc = 0;
  petID = 0;
  chiJiActive = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.DOORWAY_TO_NOWHERE.id);
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.DOORWAY_TO_NOWHERE_SUMMON.id) {
      this.doorwayActive = event.timestamp;
      this.petID = event.targetID;
      this.doorwayProc += 1;
    }

    if (spellId === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id) {
      this.chiJiActive = event.timestamp;
      if (!this.petID) {
        this.petID = event.targetID;
      }
    }
  }

  on_heal(event) {
    const spellId = event.ability.guid;

    if (event.sourceID === this.petID && spellId === SPELLS.CRANE_HEAL.id && event.timestamp < (this.doorwayActive + DOORWAYACTIVETIME) && event.timestamp < (this.chiJiActive + CHIJIACTIVETIME)) {
      this.healingOverlap += ((event.amount || 0) + (event.absorbed || 0) / 2);
    }
    if (event.sourceID === this.petID && spellId === SPELLS.CRANE_HEAL.id && event.timestamp < (this.doorwayActive + DOORWAYACTIVETIME) && event.timestamp > (this.chiJiActive + CHIJIACTIVETIME)) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    this.healing = this.healing + this.healingOverlap;
    if (debug) {
      console.log(`Doorway Healing: ${this.healing}`);
      console.log('Overlap Healing:', this.healingOverlap);
      console.log('Doorway Procs:', this.doorwayProc);
    }
  }
  item() {
    return {
      item: ITEMS.DOORWAY_TO_NOWHERE,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default DoorwayToNowhere;
