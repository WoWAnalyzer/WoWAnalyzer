import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealingStacked from 'Parser/Core/calculateEffectiveHealingStacked';
import Combatants from 'Parser/Core/Modules/Combatants';

const EXPEL_THE_DARKNESS_HEALING_INCREASE = 0.03;

/**
 * Expel the Darkness (Artifact Trait)
 * Increases healing done by Light of Dawn by 3%.
 */
class ExpelTheDarkness extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.EXPEL_THE_DARKNESS.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    this.healing += calculateEffectiveHealingStacked(event, EXPEL_THE_DARKNESS_HEALING_INCREASE, this.rank);
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (healEvent.ability.guid !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    this.healing += calculateEffectiveHealingStacked(beaconTransferEvent, EXPEL_THE_DARKNESS_HEALING_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EXPEL_THE_DARKNESS.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default ExpelTheDarkness;
