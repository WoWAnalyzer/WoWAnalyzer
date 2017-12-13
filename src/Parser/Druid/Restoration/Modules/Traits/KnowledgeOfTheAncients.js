import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Rejuvenation from '../Core/Rejuvenation';


const KNOWLEDGE_OF_THE_ANCIENT_MANA_GAIN = 880;
const BASE_MANA = 220000;
const REJUVENATION_BASE_MANA = 0.1;
/**
 * Knowledge of the Ancients (Artifact Trait)
 * Increases mana regeneration by 2%
 *
 * TODO: Reduce the effect of this trait if we didn't need the extra mana gained.
 * TODO: Look at DarkmoonDeckPromises.js for inspiration
 */
class KnowledgeOfTheAncients extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
    rejuvenation: Rejuvenation,
  };

  rank = 0;
  healing = 0;
  manaGained = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.KNOWLEDGE_OF_THE_ANCIENTS.id];
    this.active = this.rank > 0;

  }

  on_finished() {
    // MP5
    this.manaGained = ((this.owner.fightDuration/1000)/5)*KNOWLEDGE_OF_THE_ANCIENT_MANA_GAIN;
  }

  subStatistic() {
    const rejuvManaCost = BASE_MANA * REJUVENATION_BASE_MANA;
    const freeRejuvs = this.manaGained / rejuvManaCost;
    const oneRejuvenationThroughput = this.owner.getPercentageOfTotalHealingDone(this.rejuvenation.avgRejuvHealing);
    const knowledgeOfTheAncientsThroughput = oneRejuvenationThroughput * freeRejuvs;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.KNOWLEDGE_OF_THE_ANCIENTS.id}>
            <SpellIcon id={SPELLS.KNOWLEDGE_OF_THE_ANCIENTS.id} noLink /> Knowledge of the Ancients
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Knowledge of the Ancient saved you ${Math.floor(this.manaGained)} mana. The extra mana gained is translated to throughput by assuming you'd cast more rejuvenations.`}>
            ≈ {formatPercentage(knowledgeOfTheAncientsThroughput)} %
          </dfn>
        </div>
      </div>
    );
  }
}

export default KnowledgeOfTheAncients;
