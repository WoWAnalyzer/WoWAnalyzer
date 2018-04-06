import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Rejuvenation from '../Core/Rejuvenation';

const BASE_MANA = 220000;
const WILD_GROWTH_BASE_MANA = 0.34;
const REJUVENATION_BASE_MANA = 0.1;
const INFUSION_OF_NATURE_REDUCTION = 0.02;

/**
 * Infusion of Nature (Artifact Trait)
 * Reduces the mana cost of Wild Growth by 2%
 *
 * TODO: Reduce the effect of this trait if we didn't need the extra mana gained.
 * TODO: Look at DarkmoonDeckPromises.js for inspiration
 */
class InfusionOfNature extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
    rejuvenation: Rejuvenation,
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
    const oneRejuvenationThroughput = this.owner.getPercentageOfTotalHealingDone(this.rejuvenation.avgRejuvHealing);
    const infusionOfNatureThroughput = oneRejuvenationThroughput * this.freeRejuvs;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.INFUSION_OF_NATURE.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Infusion of nature saved you ${Math.floor(this.manaGained)} mana. The extra mana gained is translated to throughput by assuming you'd cast more rejuvenations.`}>
            ≈ {formatPercentage(infusionOfNatureThroughput)} %
          </dfn>
        </div>
      </div>
    );
  }
}

export default InfusionOfNature;
