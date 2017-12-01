import React from 'react';

import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from "../../../../common/SPELLS";
import { formatThousands } from "../../../../common/format";

const BASE_ITEM_LEVEL = 935;
const BASE_HASTE_VALUE = 872;

class GarothiFeedbackConduit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  currentILvl = 0;
  baseILvl = 935;
  staticHaste = 0;
  lastProcc = null;
  totalProccValue = [];
  currentUptime = 0;
  currentProccValue = 0;

  totalAverageHasteGained = 0;
  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.GAROTHI_FEEDBACK_CONDUIT.id);
    if(this.active) {
      this.currentILvl = this.combatants.selected.getTrinket(ITEMS.GAROTHI_FEEDBACK_CONDUIT.id).itemLevel;
      this.staticHaste = Math.round(BASE_HASTE_VALUE* Math.pow(1.15,((this.currentILvl-BASE_ITEM_LEVEL)/15)) * Math.pow(0.994435486, (this.currentILvl-BASE_ITEM_LEVEL)));
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

  on_finished() {
    this.totalProccValue.forEach(function(item) {
      const uptimePercent = item[1]/this.owner.fightDuration;
      this.totalAverageHasteGained += uptimePercent * item[0];
    }.bind(this));
  }

  item() {
    return {
      item: ITEMS.GAROTHI_FEEDBACK_CONDUIT,
      result: (
        <dfn
          data-tip={`This is the average haste rating gained</b>`}
        >
          {formatThousands(this.totalAverageHasteGained)} average haste rating gained.
        </dfn>
      ),
    };
  }
}

export default GarothiFeedbackConduit;
