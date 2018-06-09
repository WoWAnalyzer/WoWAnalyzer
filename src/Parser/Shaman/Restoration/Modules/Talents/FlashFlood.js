import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import Abilities from '../Abilities';

const BUFFER = 750;
const flashFloodHaste = 0.2;
const tidalWavesHaste = 0.3;

// All heal spells with cast time...
const spellsConsumingFlashFlood = [
  SPELLS.HEALING_WAVE.id,
  SPELLS.HEALING_SURGE_RESTORATION.id,
  SPELLS.CHAIN_HEAL.id,
  // SPELLS.HEALING_RAIN_HEAL.id, -- handled differently since its a HoT
  SPELLS.WELLSPRING_HEAL.id,
];

class FlashFlood extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    abilities: Abilities,
  };
  healing = 0;
  healingRainTimestamp = 0;
  healingRainHastePercent = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FLASH_FLOOD_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(this.healingRainTimestamp && spellId === SPELLS.HEALING_RAIN_HEAL.id && 
      this.healingRainTimestamp + this.abilities.getExpectedCooldownDuration(SPELLS.HEALING_RAIN_CAST.id) <= event.timestamp) {
      const flashFloodContribution = flashFloodHaste / (flashFloodHaste + this.healingRainHastePercent);
      this.healing += calculateEffectiveHealing(event, flashFloodContribution);
      return;
    }

    if (!spellsConsumingFlashFlood.includes(spellId)) {
      return;
    }

    const hasFlashFlood = this.combatants.selected.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, event.timestamp, BUFFER, BUFFER);
    if(!hasFlashFlood) {
      return;
    }

    let currentHastePercent = this.statTracker.currentHastePercentage;

    if(spellId === SPELLS.HEALING_WAVE.id) {
      const hasTidalWave = this.combatants.selected.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, BUFFER, BUFFER);
      if(hasTidalWave) {
        currentHastePercent += tidalWavesHaste;
      }
    }

    const flashFloodContribution = flashFloodHaste / (flashFloodHaste + currentHastePercent);
    this.healing += calculateEffectiveHealing(event, flashFloodContribution);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    const hasFlashFlood = this.combatants.selected.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, event.timestamp, BUFFER, BUFFER);
    if(!hasFlashFlood) {
      this.healingRainTimestamp = 0;
      return;
    }

    this.healingRainTimestamp = event.timestamp;
    this.healingRainHastePercent = this.statTracker.currentHastePercentage;
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
