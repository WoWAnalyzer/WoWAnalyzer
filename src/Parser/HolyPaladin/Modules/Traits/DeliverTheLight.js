import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const DELIVER_THE_LIGHT_HEALING_INCREASE = 0.03;

/**
 * Deliver the Light (Artifact Trait)
 * Increases healing done by Holy Light and Flash of Light by 3%.
 */
class DeliverTheLight extends Module {
  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.owner.selectedCombatant.traitsBySpellId[SPELLS.DELIVER_THE_LIGHT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.HOLY_LIGHT.id && event.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, DELIVER_THE_LIGHT_HEALING_INCREASE);
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (healEvent.ability.guid !== SPELLS.HOLY_LIGHT.id && healEvent.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }

    this.healing += calculateEffectiveHealing(beaconTransferEvent, DELIVER_THE_LIGHT_HEALING_INCREASE);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DELIVER_THE_LIGHT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
        label="Deliver the Light healing"
        tooltip={`This only calculates the value of the last Deliver the Light point (you have a total of ${this.rank} points), for you with your gear and only during this fight. The value of an additional point would be slightly lower.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.TRAITS(2);
}

export default DeliverTheLight;
