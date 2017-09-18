import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

const BASE_MANA = 220000;
const WILD_GROWTH_BASE_MANA = 0.34;
const REJUVENATION_BASE_MANA = 0.1;
const INFUSION_OF_NATURE_REDUCTION = 0.02;

/**
 * Infusion of Nature (Artifact Trait)
 * Reduces the mana cost of Wild Growth by 2%
 */
class InfusionOfNature extends Module {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  rank = 0;
  manaGained = 0;
  freeRejuvs = 0;
  wgManaCost = BASE_MANA * WILD_GROWTH_BASE_MANA;
  rejuvManaCost = BASE_MANA * REJUVENATION_BASE_MANA;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_NATURE.id];
    this.active = this.rank > 0;
  }


  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if(SPELLS.WILD_GROWTH.id !== spellId) {
      return;
    }
    this.manaGained += this.wgManaCost - (this.wgManaCost * (1 - INFUSION_OF_NATURE_REDUCTION));
    this.freeRejuvs = this.manaGained / this.rejuvManaCost;
  }

  subStatistic() {
    //TODO Change the oneRejuvenationThroughput to the one in the rejuvenation module
    const oneRejuvenationThroughput = this.owner.getPercentageOfTotalHealingDone(this.owner.modules.treeOfLife.totalHealingFromRejuvenationEncounter) / this.owner.modules.treeOfLife.totalRejuvenationsEncounter;
    const infusionOfNatureThroughput = oneRejuvenationThroughput * this.freeRejuvs;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.INFUSION_OF_NATURE.id}>
            <SpellIcon id={SPELLS.INFUSION_OF_NATURE.id} noLink /> Infusion of Nature
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(infusionOfNatureThroughput)} %
        </div>
      </div>
    );
  }
}

export default InfusionOfNature;
