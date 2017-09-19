import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Rejuvenation from '../Features/Rejuvenation';


const KNOWLEDGE_OF_THE_ANCIENT_MANA_GAIN = 880;
const BASE_MANA = 220000;
const REJUVENATION_BASE_MANA = 0.1;
/**
 * Knowledge of the Ancients (Artifact Trait)
 * Increases mana regeneration by 2%
 */
class KnowledgeOfTheAncients extends Module {
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
          {formatPercentage(knowledgeOfTheAncientsThroughput)} %
        </div>
      </div>
    );
  }
}

export default KnowledgeOfTheAncients;
