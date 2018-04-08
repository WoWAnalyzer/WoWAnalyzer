import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const BLESSING_OF_THE_WORLD_TREE_HEALING_INCREASE = 0.03;

/**
 * Blessing of the World Tree (Artifact Trait)
 * Increases the healing done by Healing Touch and initial healing done by Regrowth by 3%
 */
class BlessingOfTheWorldTree extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.BLESSING_OF_THE_WORLD_TREE.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if(event.ability.guid !== SPELLS.HEALING_TOUCH.id && (event.ability.guid !== SPELLS.REGROWTH.id || event.tick) ) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, BLESSING_OF_THE_WORLD_TREE_HEALING_INCREASE * this.rank)/ this.rank;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.BLESSING_OF_THE_WORLD_TREE.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default BlessingOfTheWorldTree;
