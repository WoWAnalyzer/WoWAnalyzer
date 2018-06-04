import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const BUFFER = 750;
const flashFloodHaste = 0.2;

// All heal spells with cast time...
const spellsConsumingFlashFlood = [
  SPELLS.HEALING_WAVE.id,
  SPELLS.HEALING_SURGE_RESTORATION.id,
  SPELLS.CHAIN_HEAL.id,
  SPELLS.HEALING_RAIN_HEAL.id, // should a HoT be here
  // SPELLS.WELLSPRING_HEAL.id, -- bugged for now, to be fixed soon
];

class FlashFlood extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FLASH_FLOOD_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (!spellsConsumingFlashFlood.includes(spellId)) {
      return;
    }

    const hasFlashFlood = this.combatants.selected.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, event.timestamp, BUFFER, BUFFER);
    if(!hasFlashFlood) {
      return;
    }

    const currentHastePercent = this.statTracker.currentHastePercentage;
    const crashingWavesContribution = flashFloodHaste / (flashFloodHaste + currentHastePercent);
    this.healing += calculateEffectiveHealing(event, crashingWavesContribution);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default FlashFlood;
