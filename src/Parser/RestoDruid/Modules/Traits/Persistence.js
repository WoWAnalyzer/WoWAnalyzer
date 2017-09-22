import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Rejuvenation from '../Features/Rejuvenation';


/**
 * Persistence (Artifact Trait)
 * Increases the duration of Moonfire, Rejuvenation and Sunfire by 1s. We will only look at the Rejuvenation part.
 *
 * This modules checks whenever a rejuvenation is applied or refreshed and add that as 1s to the variable persistanceValue.
 * We make use of what the average healing from one second of rejuvenation did.
 * This doesn't take "magic" rejuvenations into account that doesn't trigger an apply/refreshbuff event.
 * TODO: Improve this module:
 * TODO: Add mastery healing, add cultivation (?),
 * TODO: Subtractions for overheals on last tick, subtractions for early refreshes
 * TODO: Include "magic rejuvenations" such as deep rooted.
 */
class Persistence extends Module {
  static dependencies = {
    combatants: Combatants,
    rejuvenation: Rejuvenation,
  };

  rank = 0;
  totalPersistanceValue = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.PERSISTENCE_TRAIT.id];
    this.active = this.rank > 0;
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

  getSpellUptime(spellId) {
    return Object.keys(this.combatants.players)
      .map(key => this.combatants.players[key])
      .reduce((uptime, player) =>
        uptime + player.getBuffUptime(spellId), 0);
  }

  subStatistic() {
    const uptimeRejuvenation = Math.floor((this.getSpellUptime(SPELLS.REJUVENATION.id) + this.getSpellUptime(SPELLS.REJUVENATION_GERMINATION.id)) / 1000);
    const totalRejuvenationHealing = this.rejuvenation.totalRejuvHealing;
    const oneSecondRejuvenationHealing = totalRejuvenationHealing/uptimeRejuvenation;

    const persistenceThroughput = this.owner.getPercentageOfTotalHealingDone(this.totalPersistanceValue * oneSecondRejuvenationHealing);

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.PERSISTENCE_TRAIT.id}>
            <SpellIcon id={SPELLS.PERSISTENCE_TRAIT.id} noLink /> Persistence
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`
            Disclaimer - as of right now this is an estimate at best. We take the average healing of one second of rejuvenation and multiply
            that by amounts of seconds of rejuvenation one level of persistence would yield.</br></br>
            These factors are not yet considered in the module and may decrease the overall accuracy of the results:
            <ul>
              <li>+ Mastery healing</li>
              <li>+ Cultivation</li>
              <li>+ "Magic" rejuvenations such as deep rooted</li>
              <li>- Subtractions for generally higher overheal on the last tick</li>
              <li>- Subtractions from early refreshes of rejuvenation.</li>
            </ul>
            Estimated accuracy of the result is 80%
          `}>
            ≈ {formatPercentage(persistenceThroughput)} %
          </dfn>
        </div>
      </div>
    );
  }
}

export default Persistence;
