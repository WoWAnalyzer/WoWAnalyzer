import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

const BUFFER = 100;
const cooldownIncrease = 5000;
const maxHits = 6;

/**
 * CD changes depending on amount of effective targets hit (0 = 5s, 6 = 35s)
 */

class Downpour extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
  };
  healing = 0;
  downpourHits = 0;
  downpourTimestamp = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DOWNPOUR_TALENT.id);
  }

  on_byPlayer_heal(event) {
    // This spells cooldown gets increased depending on how many targets you heal
    // instead we set it to the maximum possible cooldown and reduce it by how many it fully overhealed or missed
    if(this.downpourTimestamp && event.timestamp > this.downpourTimestamp + BUFFER) {
      const reductionMS = (maxHits - this.downpourHits) * cooldownIncrease;
      this.spellUsable.reduceCooldown(SPELLS.DOWNPOUR_TALENT.id, reductionMS);
      this.downpourTimestamp = 0;
      this.downpourHits = 0;
    }
    
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DOWNPOUR_TALENT.id) {
      return;
    }

    if(event.amount) {
      this.downpourHits += 1;
    }

    this.downpourTimestamp = event.timestamp;
    this.healing += event.amount;
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.DOWNPOUR_TALENT.id);
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DOWNPOUR_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %
        </div>
      </div>
    );
  }

}

export default Downpour;

