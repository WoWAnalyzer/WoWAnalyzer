import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const SEEDS_OF_THE_WORLD_TREE_HEALING_INCREASE = 0.08;

/**
 * Seeds of the World Tree (Artifact Trait)
 * Increases healing done by Swiftmend by 10%
 */
class SeedsOfTheWorldTree extends Module {
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
    this.healing += calculateEffectiveHealing(event, SEEDS_OF_THE_WORLD_TREE_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SEEDS_OF_THE_WORLD_TREE.id}>
            <SpellIcon id={SPELLS.SEEDS_OF_THE_WORLD_TREE.id} noLink /> Seeds of the World Tree
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default SeedsOfTheWorldTree;
