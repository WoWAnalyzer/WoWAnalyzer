import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const EXTENDED_HEALING_HEALING_INCREASE = 0.05;

/**
 * Extended Healing (Artifact Trait)
 * Increases Renewing Mist duration by 1 second.
 * Currently estimating the increase at 5% per rank. 1 additional second of duration over a base of 20 seconds is the logic.
 * ISSUE: REM can jump to a new target if the current target is at full HP. Also, with Dancing Mist (Artifact Trait) REM can also replicate to a new target either on cast or on jump. Requires tracking potentially multiple splits of the spell. Need to implement a better way to track this.
 */

class ExtendedHealing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.EXTENDED_HEALING.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.RENEWING_MIST_HEAL.id) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, EXTENDED_HEALING_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EXTENDED_HEALING.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default ExtendedHealing;
