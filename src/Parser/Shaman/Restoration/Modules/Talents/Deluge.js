import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import HealingRainLocation from '../ShamanCore/HealingRainLocation';

const DELUGE_HEALING_INCREASE = 0.20;

/**
 * Chain Heal heals for an additional 20% on targets within your Healing Rain or affected by your Riptide.
 */
class Deluge extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingRainLocation: HealingRainLocation,
  };
  healing = 0;
  eventsDuringRain = [];

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DELUGE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // Pet healing
      this.eventsDuringRain.push(event);
      return;
    }

    const hasBuff = combatant.hasBuff(SPELLS.RIPTIDE.id, event.timestamp, undefined, undefined, this.owner.playerID);
    if (!hasBuff) {
      // We add events for the Healing Rain here, so that it doesn't double dip on targets with Riptide
      this.eventsDuringRain.push(event);
      return;
    }

    this.healing += calculateEffectiveHealing(event, DELUGE_HEALING_INCREASE);
  }

  // Due to the nature of having to wait until rain is over, to be able to find out its position,
  // we only start processing the healing contribution on the next cast of Healing Rain or at the end of combat.
  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id || event.isCancelled) { 
      return;
    }

    // filters out the first cast in combat if there was no pre-cast, or if there were no Chain Heal casts anyway.
    if(this.eventsDuringRain.length === 0) {
      return;
    }

    this.healing += this.healingRainLocation.processHealingRain(this.eventsDuringRain, DELUGE_HEALING_INCREASE);
    this.eventsDuringRain.length = 0;
  }

  on_finished() {
    if (!this.eventsDuringRain.length) { 
      return;
    }
    
    this.healing += this.healingRainLocation.processLastRain(this.eventsDuringRain, DELUGE_HEALING_INCREASE);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DELUGE_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default Deluge;
