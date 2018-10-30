import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

const BUFFER = 2000;

class OverflowingShores extends BaseHealerAzerite {
  potentialHits = 0;
  healingRainCastTimestamp = 0;

  static TRAIT = SPELLS.OVERFLOWING_SHORES_TRAIT.id;
  static HEAL = SPELLS.OVERFLOWING_SHORES_HEAL.id;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id || event.isCancelled) {
      return;
    }
    this.healingRainCastTimestamp = event.timestamp;
  }

  on_byPlayer_heal(event) {
    super.on_byPlayer_heal(event);

    const spellId = event.ability.guid;
    if (this.hasTrait) {
      if (spellId !== SPELLS.OVERFLOWING_SHORES_HEAL.id) {
        return;
      }
      this.potentialHits += 1;

      // checking how many people the initial of healing rain hits, while filtering out overheal events
    } else if (this.healingRainCastTimestamp && spellId === SPELLS.HEALING_RAIN_HEAL.id && this.healingRainCastTimestamp <= event.timestamp && this.healingRainCastTimestamp >= event.timestamp - BUFFER) {
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

