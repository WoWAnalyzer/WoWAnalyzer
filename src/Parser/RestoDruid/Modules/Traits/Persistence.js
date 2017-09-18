import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Persistence (Artifact Trait)
 * Increases the duration of Moonfire, Rejuvenation and Sunfire by 1s. We will only look at the Rejuvenation part.
 * This is may be a little underestimated since it doesn't include the increased bonuses from Dreamwalker, Increased avg mastery, Amanthul's Wisdom,
 * Flourish, EoG etc. Rejuvenation has so many external variables so this calculation is an estimate at best.
 *
 * This modules checks whenever a rejuvenation is applied or refreshed and add that as 1s to the variable persistanceValue.
 * This doesn't take "magic" rejuvenations into account that doesn't trigger an apply/refreshbuff event.
 * TODO: Improve this module
 */
class Persistence extends Module {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  rank = 0;
  healing = 0;
  totalPersistanceValue = 0;
  rejuvenationDuration = 12;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.PERSISTENCE_TRAIT.id];
    this.active = this.rank > 0;
    this.rejuvenationDuration += this.rank;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.REJUVENATION.id !== spellId && SPELLS.REJUVENATION_GERMINATION.id !== spellId) {
      return;
    }
    this.totalPersistanceValue++;
  }
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.REJUVENATION.id !== spellId && SPELLS.REJUVENATION_GERMINATION.id !== spellId) {
      return;
    }
    this.totalPersistanceValue++;
  }

  subStatistic() {
    const freeRejuvs = this.totalPersistanceValue / this.rejuvenationDuration;
    const oneRejuvenationThroughput = this.owner.getPercentageOfTotalHealingDone(this.owner.modules.treeOfLife.totalHealingFromRejuvenationEncounter) / this.owner.modules.treeOfLife.totalRejuvenationsEncounter;
    const persistenceThroughput = oneRejuvenationThroughput * freeRejuvs;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.PERSISTENCE_TRAIT.id}>
            <SpellIcon id={SPELLS.PERSISTENCE_TRAIT.id} noLink /> Persistence
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(persistenceThroughput)} %
        </div>
      </div>
    );
  }
}

export default Persistence;
