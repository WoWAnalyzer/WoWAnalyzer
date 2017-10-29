import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Analyzer from 'Parser/Core/Analyzer';

const debug = false;
const PETRICHOR_REDUCTION = 2000;

class PetrichorLagniappe extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  REVIVAL_BASE_COOLDOWN = 0;
  totalReductionTime = 0;
  currentReductionTime = 0;
  wastedReductionTime = 0;
  initialWastedReductionTime = 0;
  casts = 0;
  lastCastTime = 0;
  cdReductionUsed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.PETRICHOR_LAGNIAPPE.id);
    if (this.active) {
      this.REVIVAL_BASE_COOLDOWN = 180000 - (this.combatants.selected.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0) * 10000;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.REVIVAL.id) {
      if (this.casts !== 0) {
        debug && console.log('Time since last Revival cast: ', (event.timestamp - this.lastCastTime), ' //// Revival CD: ', this.REVIVAL_BASE_COOLDOWN);
        if ((event.timestamp - this.lastCastTime) < this.REVIVAL_BASE_COOLDOWN) {
          this.cdReductionUsed += 1;
        }
        this.wastedReductionTime += (event.timestamp - this.lastCastTime) - (this.REVIVAL_BASE_COOLDOWN - this.currentReductionTime);
        this.lastCastTime = event.timestamp;
        this.currentReductionTime = 0;
      }
      // Tracking initial Revival cast - Any REM casts before this are considered wasted.
      if (this.casts === 0) {
        this.wastedReductionTime += this.currentReductionTime;
        this.initialWastedReductionTime = this.currentReductionTime;
        this.casts += 1;
        this.lastCastTime = event.timestamp;
        this.currentReductionTime = 0;
      }
    }

    if (spellId === SPELLS.RENEWING_MIST.id) {
      this.totalReductionTime += PETRICHOR_REDUCTION;
      this.currentReductionTime += PETRICHOR_REDUCTION;
    }
  }

  on_finished() {
    if (((this.owner.fight.end_time - this.lastCastTime) - (this.REVIVAL_BASE_COOLDOWN - this.currentReductionTime)) > 0) {
      this.wastedReductionTime += (this.owner.fight.end_time - this.lastCastTime) - (this.REVIVAL_BASE_COOLDOWN - this.currentReductionTime);
    }
    if (debug) {
      console.log('Time Reduction: ', this.totalReductionTime);
      console.log('Wasted Reduction:', this.wastedReductionTime);
    }
  }
  item() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    return {
      item: ITEMS.PETRICHOR_LAGNIAPPE,
      result: (
        <dfn data-tip={`The wasted cooldown reduction from the legendary bracers. ${formatNumber((this.wastedReductionTime / getAbility(SPELLS.REVIVAL.id).casts) / 1000)} seconds (Average wasted cooldown reduction per cast).`}>
          {formatNumber(this.wastedReductionTime / 1000)} seconds wasted
        </dfn>
      ),
    };
  }
}

export default PetrichorLagniappe;
