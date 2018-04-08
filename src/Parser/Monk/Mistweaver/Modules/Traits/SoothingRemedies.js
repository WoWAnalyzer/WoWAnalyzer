import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const SOOTHING_REMEDIES_HEALING_INCREASE = 0.03;

/**
 * Soothing Remedies (Artifact Trait)
 * Increases healing done by Soothing Mist by 3%.
 */
class SoothingRemedies extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.SOOTHING_REMEDIES.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.SOOTHING_MIST.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, SOOTHING_REMEDIES_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SOOTHING_REMEDIES.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default SoothingRemedies;
