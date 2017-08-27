import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const EXPEL_THE_DARKNESS_HEALING_INCREASE = 0.03;

/**
 * Expel the Darkness (Artifact Trait)
 * Increases healing done by Light of Dawn by 3%.
 */
class ExpelTheDarkness extends Module {
  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.owner.selectedCombatant.traitsBySpellId[SPELLS.EXPEL_THE_DARKNESS.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, EXPEL_THE_DARKNESS_HEALING_INCREASE);
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (healEvent.ability.guid !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(beaconTransferEvent, EXPEL_THE_DARKNESS_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EXPEL_THE_DARKNESS.id}>
            <SpellIcon id={SPELLS.EXPEL_THE_DARKNESS.id} noLink /> Expel the Darkness
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default ExpelTheDarkness;
