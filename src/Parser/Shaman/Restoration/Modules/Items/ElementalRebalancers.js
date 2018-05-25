import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';
import HealingRainLocation from '../ShamanCore/HealingRainLocation';

const REBALANCERS_HEALING_INCREASE = 0.10;

/**
 * Allies within your Healing Rain receive 10% increased healing from your other healing spells.
 */
class ElementalRebalancers extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingRainLocation: HealingRainLocation,
  };
  healing = 0;
  eventsDuringRain = [];

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.ELEMENTAL_REBALANCERS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // healing rain itself is not affected
    if (spellId === SPELLS.HEALING_RAIN_HEAL.id) {
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }

    this.eventsDuringRain.push(event);
  }

  // Due to the nature of having to wait until rain is over, to be able to find out its position,
  // we only start processing the healing contribution on the next cast of Healing Rain or at the end of combat.
  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id || event.isCancelled) { 
      return;
    }

    // filters out the first cast in combat if there was no pre-cast.
    if(this.eventsDuringRain.length === 0) {
      return;
    }

    this.healing += this.healingRainLocation.processHealingRain(this.eventsDuringRain, REBALANCERS_HEALING_INCREASE);
    this.eventsDuringRain.length = 0;
  }

  on_finished() {
    if(!this.eventsDuringRain.length) {
      return;
    }

    this.healing += this.healingRainLocation.processHealingRain(this.eventsDuringRain, REBALANCERS_HEALING_INCREASE);
  }

  item() {
    return {
      item: ITEMS.ELEMENTAL_REBALANCERS,
      result: (
        <ItemHealingDone amount={this.healing} />
      ),
    };
  }
}

export default ElementalRebalancers;
