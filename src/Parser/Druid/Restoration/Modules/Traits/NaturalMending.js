import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS';


import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

const NATURAL_MENDING_HEALING_INCREASE = 0.1;

/**
 * Natural Mending (Artifact Trait)
 * Increases healing done by Swiftmend by 10%
 */
class NaturalMending extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.NATURAL_MENDING.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if(event.ability.guid !== SPELLS.SWIFTMEND.id) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, NATURAL_MENDING_HEALING_INCREASE * this.rank) / this.rank;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.NATURAL_MENDING.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default NaturalMending;
