import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS';


import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const SEEDS_OF_THE_WORLD_TREE_HEALING_INCREASE = 0.08 / 0.25;

/**
 * Seeds of the World Tree (Artifact Trait)
 * Living Seed heals for an additional 8% of the initial heal which planted it.
 */
class SeedsOfTheWorldTree extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.SEEDS_OF_THE_WORLD_TREE.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if(event.ability.guid !== SPELLS.LIVING_SEED.id) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, SEEDS_OF_THE_WORLD_TREE_HEALING_INCREASE * this.rank) / this.rank;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SEEDS_OF_THE_WORLD_TREE.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default SeedsOfTheWorldTree;
