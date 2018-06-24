import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const COALESCING_MISTS_HEALING_INCREASE = 0.03;

/**
 * Coalescing Mists (Artifact Trait)
 * Increases healing done by Effuse by 3%.
 */
class CoalescingMists extends Analyzer {
  rank = 0;
  healing = 0;

  constructor(...args) {
    super(...args);
    this.rank = this.selectedCombatant.traitsBySpellId[SPELLS.COALESCING_MISTS.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.EFFUSE.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, COALESCING_MISTS_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.COALESCING_MISTS.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default CoalescingMists;
