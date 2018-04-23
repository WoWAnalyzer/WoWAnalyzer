import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const ESSENCE_OF_THE_MIST_HEALING_INCREASE = 0.05;

/**
 * Essence of the Mist (Artifact Trait)
 * Increases healing done by Essence Font by 5%.
 */
class EssenceOfTheMist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.ESSENCE_OF_THE_MIST.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.ESSENCE_FONT.id && event.ability.guid !== SPELLS.ESSENCE_FONT_BUFF.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, ESSENCE_OF_THE_MIST_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ESSENCE_OF_THE_MIST.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default EssenceOfTheMist;
