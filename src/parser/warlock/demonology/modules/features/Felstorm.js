import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Events from 'parser/core/Events';

const FELSTORM_COOLDOWN = 30;
// when Demonic Strength is cast, then AFTER the cast, Felguard charges at the target, and after he arrives, does the Felstorm
// this delay is so that every Felstorm caused by Demonic Strength accounts for the charge "travel" time
const DEMONIC_STRENGTH_BUFFER = 1500;


class Felstorm extends Analyzer {
  _lastDemonicStrengthCast = null;
  mainPetFelstormCount = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_STRENGTH_TALENT), this.demonicStrengthCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER_PET).spell(SPELLS.FELSTORM_BUFF), this.applyFelstormBuff);
  }

  demonicStrengthCast(event) {
    this._lastDemonicStrengthCast = event.timestamp;
  }

  // works with either direct /cast Felstorm or by using the Command Demon ability (if direct /cast Felstorm, then the player didn't cast it, but this buff gets applied either way)
  applyFelstormBuff(event) {
    if (this._lastDemonicStrengthCast && event.timestamp <= this._lastDemonicStrengthCast + DEMONIC_STRENGTH_BUFFER) {
      // casting Demonic Strength triggers Felstorm as well, but we care about the pet ability itself, which is on separate cooldown
      return;
    }
    if (!event.sourceInstance) {
      // permanent Felguard doesn't have sourceInstance, while Grimoire: Felguard does (both use Felstorm in the exact same way)
      this.mainPetFelstormCount += 1;
    }
  }

  get maxCasts() {
    return Math.ceil(calculateMaxCasts(FELSTORM_COOLDOWN, this.owner.fightDuration));
  }

  get suggestionThresholds(){
    const percentage = (this.mainPetFelstormCount / this.maxCasts) || 0;
    return {
      actual: percentage,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You should use your Felguard's <SpellLink id={SPELLS.FELSTORM_BUFF.id} /> more often, preferably on cooldown.</>)
          .icon(SPELLS.FELSTORM_BUFF.icon)
          .actual(`${this.mainPetFelstormCount} out of ${this.maxCasts} (${formatPercentage(actual)} %) Felstorm casts.`)
          .recommended(`> ${formatPercentage(recommended)} % is recommended`);
      });
  }
}

export default Felstorm;
