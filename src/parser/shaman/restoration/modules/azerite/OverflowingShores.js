import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

const BUFFER = 2000;

class OverflowingShores extends BaseHealerAzerite {
  potentialHits = 0;
  healingRainCastTimestamp = null;

  static TRAIT = SPELLS.OVERFLOWING_SHORES_TRAIT;
  static HEAL = SPELLS.OVERFLOWING_SHORES_HEAL;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;
    this.moreInformation = "The size increase of Healing Rain is not factored into the healing";

    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_CAST), this._onRainBegincast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL), this._onRainHeal);
  }

  _onRainBegincast(event) {
    if (event.isCancelled) {
      return;
    }
    this.healingRainCastTimestamp = event.timestamp;
  }

  _onRainHeal(event) {
    // checking how many people the initial of healing rain hits, while filtering out overheal events
    if (!this.hasTrait && this.healingRainCastTimestamp && this.healingRainCastTimestamp >= event.timestamp - BUFFER) {
      if (event.overheal) {
        return;
      }
      this.potentialHits += 1;
    }
  }

  get overflowingShoresHits() {
    return this.potentialHits;
  }
}

export default OverflowingShores;

