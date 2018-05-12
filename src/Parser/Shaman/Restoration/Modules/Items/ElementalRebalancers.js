import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import Abilities from '../Abilities';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';
import {_isPlayerInsideHealingRain} from '../../Normalizers/DelugeNormalizer';

const REBALANCERS_HEALING_INCREASE = 0.1;

class ElementalRebalancers extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };
  healing = 0;
  healingRainIndex = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.ELEMENTAL_REBALANCERS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HEALING_RAIN_HEAL.id) {
      return;
    }

    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    const healingRainDuration = this.abilities.getExpectedCooldownDuration(SPELLS.HEALING_RAIN_CAST.id);
    if ((event.timestamp <= this.healingRainTimestamp + healingRainDuration) || (!this.healingRainTimestamp && event.timestamp <= this.owner.fight.start_time + healingRainDuration)) {
      if(_isPlayerInsideHealingRain(event, this.healingRainIndex)){
        this.healing += calculateEffectiveHealing(event, REBALANCERS_HEALING_INCREASE);
      }
    }
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    if(!event.isCancelled) {
      this.healingRainIndex += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    
    this.healingRainTimestamp = event.timestamp;
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
