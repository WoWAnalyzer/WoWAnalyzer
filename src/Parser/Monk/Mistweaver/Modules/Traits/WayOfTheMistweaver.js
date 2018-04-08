import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const WAY_OF_THE_MISTWEAVER_HEALING_INCREASE = 0.03;

/**
 * Way of the Mistweave (Artifact Trait)
 * Increases healing done by Eveloping Mist by 3%.
 */
class WayOfTheMistweaver extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.WAY_OF_THE_MISTWEAVER.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.ENVELOPING_MISTS.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, WAY_OF_THE_MISTWEAVER_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.WAY_OF_THE_MISTWEAVER.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default WayOfTheMistweaver;
