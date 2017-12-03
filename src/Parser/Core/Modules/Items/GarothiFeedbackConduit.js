import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from "common/SPELLS";
import { formatThousands } from "common/format";
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const BASE_ITEM_LEVEL = 935;
const BASE_HASTE_VALUE = 872;

class GarothiFeedbackConduit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  staticHaste = 0;
  lastProcc = null;
  totalProccValue = [];
  currentUptime = 0;
  currentProccValue = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.GAROTHI_FEEDBACK_CONDUIT.id);
    if(this.active) {
      const currentILvl = this.combatants.selected.getTrinket(ITEMS.GAROTHI_FEEDBACK_CONDUIT.id).itemLevel;
      this.staticHaste = calculateSecondaryStatDefault(BASE_ITEM_LEVEL, BASE_HASTE_VALUE, currentILvl);
    }
  }

  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.FEEDBACK_LOOP.id) {
      return;
    }
    if(this.lastProcc == null) {
      this.lastProcc = event.timestamp;
    } else {
      this.currentUptime += event.timestamp - this.lastProcc;
      this.currentProccValue = event.oldStacks * this.staticHaste;
      this.lastProcc = event.timestamp;

      if(event.newStacks === 0) {
        // Buff has fallen off, sum it up
        this.totalProccValue.push([this.currentProccValue, this.currentUptime]);

        this.currentProccValue = 0;
        this.currentUptime = 0;
        this.lastProcc = null;
      }
    }
  }

  item() {
    const avgHaste =
      this.totalProccValue.reduce((acc, proc) => acc + (proc[0] * proc[1]), 0) / this.owner.fightDuration;

    return {
      item: ITEMS.GAROTHI_FEEDBACK_CONDUIT,
      result: (
        <dfn>
          {formatThousands(avgHaste)} average haste rating gained.
        </dfn>
      ),
    };
  }
}

export default GarothiFeedbackConduit;
