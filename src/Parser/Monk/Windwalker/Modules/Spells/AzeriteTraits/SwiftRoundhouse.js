import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

class SwiftRoundhouse extends Analyzer {
  totalStacks = 0;
  stacksUsed = 0;
  currentStacks = 0;
  stacksWasted = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SWIFT_ROUNDHOUSE.id);
  }
  
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SWIFT_ROUNDHOUSE_BUFF.id) {
      this.totalStacks += 1;
      this.currentStacks += 1;
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SWIFT_ROUNDHOUSE_BUFF.id) {
      this.totalStacks += 1;
      this.currentStacks += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLACKOUT_KICK.id && this.currentStacks === 2) {
      this.stacksWasted += 1;
    }
    else if (spellId === SPELLS.RISING_SUN_KICK.id) {
      this.stacksUsed += this.currentStacks;
      this.currentStacks = 0;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SWIFT_ROUNDHOUSE_BUFF) {
      return;
    }
    /** this.currentStacks is set to 0 when the stacks are consumed with Rising Sun Kick which happens before the removebuff event is triggered
     *  this allows us to easily check whether the buff was removed by using Rising Sun Kick or by expiring
     */
    if (this.currentStacks === 0) {
      this.stacksWasted += this.currentStacks;
    }
    this.currentStacks = 0;
  }

  get stackEfficiencyPercentage() {
    return this.stacksUsed / this.totalStacks;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SWIFT_ROUNDHOUSE.id}
        value={`${formatPercentage(this.stackEfficiencyPercentage)}% stacks used`}
        tooltip={`You wasted ${this.stacksWasted} stacks by letting them expire or by using Blackout Kick while you already had 2 stacks of Swift Roundhouse`}
      />
    );
  }
}

export default SwiftRoundhouse;
