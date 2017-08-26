import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

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

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EXPEL_THE_DARKNESS.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
        label="Expel the Darkness healing"
        tooltip="This only calculates the value of the last Expel the Darkness point, for you with your gear and only during this fight. The value of an additional point would be slightly lower."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.TRAITS(3);
}

export default ExpelTheDarkness;
