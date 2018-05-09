import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const BUFFER_WAVE = 750;
const BUFFER_SURGE = 100;
const crashingWavesIncrease = 0.1;
const baseTidalWavesHaste = 0.3;
const baseTidalWavesCrit = 0.4;

class CrashingWaves extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CRASHING_WAVES_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HEALING_SURGE_RESTORATION.id) {

      const hasTidalWaves = this.combatants.selected.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, BUFFER_SURGE, BUFFER_SURGE);
      const isCrit = event.hitType === HIT_TYPES.CRIT;
      if(!hasTidalWaves || !isCrit) {
        return;
      }
      const currentCritPercent = this.statTracker.currentCritPercentage + baseTidalWavesCrit;
      const crashingWavesContribution = crashingWavesIncrease / (crashingWavesIncrease + currentCritPercent);
      this.healing += calculateEffectiveHealing(event, crashingWavesContribution);

    } else if (spellId === SPELLS.HEALING_WAVE.id) {

      const hasTidalWaves = this.combatants.selected.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, BUFFER_WAVE, BUFFER_WAVE);
      if(!hasTidalWaves) {
        return;
      }
      const currentHastePercent = this.statTracker.currentHastePercentage + baseTidalWavesHaste;
      const crashingWavesContribution = crashingWavesIncrease / (crashingWavesIncrease + currentHastePercent);
      this.healing += calculateEffectiveHealing(event, crashingWavesContribution);
      
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CRASHING_WAVES_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default CrashingWaves;

