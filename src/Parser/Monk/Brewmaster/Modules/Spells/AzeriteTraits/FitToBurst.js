import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

const FTB_STACKS = 3;

// Fit to Burst
//
// Drinking Purifying Brew while at Heavy Stagger causes your next 3 melee abilities to heal you for 1315.
//
// Example Report: https://www.warcraftlogs.com/reports/rTjvNCzA7DgJRBmf#fight=38&source=6
class FitToBurst extends Analyzer {
  totalHealing = 0;
  // ftb grants 3 stacks of a buff that are consumed by melee abilities
  stacksWasted = 0;

  // tracking purifies that actually triggered it
  triggeringPurifies = 0;
  totalPurifies = 0;


  _currentStacks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FIT_TO_BURST.id);
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      return;
    }
    this.totalPurifies += 1;
    if(this.selectedCombatant.hasBuff(SPELLS.HEAVY_STAGGER_DEBUFF.id)) {
      this.triggeringPurifies += 1;
    }
  }
  
  on_toPlayer_heal(event) {
    if(event.ability.guid !== SPELLS.FIT_TO_BURST_HEAL.id) {
      return;
    }

    this.totalHealing += event.amount;
  }

  on_toPlayer_applybuff(event) {
    if(event.ability.guid !== SPELLS.FIT_TO_BURST_BUFF.id) {
      return;
    }

    if(this._currentStacks > 0) {
      this.stacksWasted = this._currentStacks;
    }

    this._currentStacks = FTB_STACKS;
  }

  on_toPlayer_removebuffstack(event) {
    if(event.ability.guid !== SPELLS.FIT_TO_BURST_BUFF.id) {
      return;
    }

    this._currentStacks = event.stack;
  }

  on_toPlayer_removebuff(event) {
    if(event.ability.guid !== SPELLS.FIT_TO_BURST_BUFF.id) {
      return;
    }

    this._currentStacks = 0;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FIT_TO_BURST.id}
        value={(
          <ItemHealingDone amount={this.totalHealing} />
        )}
        tooltip={`Fit to Burst healed you for <b>${formatNumber(this.totalHealing)}</b>.<br/>
            <b>${formatNumber(this.stacksWasted)}</b> stacks of healing wasted by double-purifying.<br/>
            <b>${formatNumber(this.triggeringPurifies)}</b> of your ${formatNumber(this.totalPurifies)} purifies triggered Fit to Burst.`}
      />
    );
  }
}

export default FitToBurst;
