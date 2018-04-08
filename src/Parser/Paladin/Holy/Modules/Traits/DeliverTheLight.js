import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealingStacked from 'Parser/Core/calculateEffectiveHealingStacked';
import Combatants from 'Parser/Core/Modules/Combatants';

const DELIVER_THE_LIGHT_HEALING_INCREASE = 0.03;

/**
 * Deliver the Light (Artifact Trait)
 * Increases healing done by Holy Light and Flash of Light by 3%.
 */
class DeliverTheLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.DELIVER_THE_LIGHT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.HOLY_LIGHT.id && event.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }

    this.healing += calculateEffectiveHealingStacked(event, DELIVER_THE_LIGHT_HEALING_INCREASE, this.rank);
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (healEvent.ability.guid !== SPELLS.HOLY_LIGHT.id && healEvent.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }

    this.healing += calculateEffectiveHealingStacked(beaconTransferEvent, DELIVER_THE_LIGHT_HEALING_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DELIVER_THE_LIGHT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default DeliverTheLight;
