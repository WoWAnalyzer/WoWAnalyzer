import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const PROTECTION_OF_SHAOHAO_HEALING_INCREASE = 0.05;

/**
 * Protection of Shaohao (Artifact Trait)
 * Increases absorb amount by Life Cocoon by 5%.
 */
class ProtectionOfShaohao extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.PROTECTION_OF_SHAOHAO.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_absorbed(event) {
    if (event.ability.guid !== SPELLS.LIFE_COCOON.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, PROTECTION_OF_SHAOHAO_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.PROTECTION_OF_SHAOHAO.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default ProtectionOfShaohao;
