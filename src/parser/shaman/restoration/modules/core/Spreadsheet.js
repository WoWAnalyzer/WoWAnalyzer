import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import SPELLS from 'common/SPELLS';

const halfHP = 0.5;
const rainBuffer = 2000;
const linkBufferStart = 500;
const linkBufferEnd = 1500;

class Spreadsheet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  potentialSurgingTideProcs = 0;
  potentialOverflowingShoresTargets = 0;
  potentialSpoutingSpiritsTargets = 0;

  spiritLinkCastTimestamp = 0;
  healingRainCastTimestamp = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SPIRIT_LINK_TOTEM.id) {
      this.spiritLinkCastTimestamp = event.timestamp;
    }
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id || event.isCancelled) {
      return;
    }
    this.healingRainCastTimestamp = event.timestamp;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RIPTIDE.id && !event.tick) {
      const currentHealth = Math.max(0, (event.hitPoints - event.amount) / event.maxHitPoints);
      if (currentHealth >= halfHP) {
        return;
      }
      this.potentialSurgingTideProcs += 1;

      // checking how many people the initial of healing rain hits, while filtering out overheal events
    } else if (this.healingRainCastTimestamp && spellId === SPELLS.HEALING_RAIN_HEAL.id && this.healingRainCastTimestamp <= event.timestamp && this.healingRainCastTimestamp >= event.timestamp - rainBuffer) {
      if (event.overheal) {
        return;
      }
      this.potentialOverflowingShoresTargets += 1;
    }
  }
  
  on_byPlayerPet_heal(event) {
    const spellId = event.ability.guid;
    // checking for a 1 second timespan shortly after SLT cast to find out how many people are inside the link when spouting spirits would heal
    if (spellId === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id && this.spiritLinkCastTimestamp <= event.timestamp - linkBufferStart && this.spiritLinkCastTimestamp >= event.timestamp - linkBufferEnd) {
      this.potentialSpoutingSpiritsTargets += 1;
    }
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    // checking for a 1 second timespan shortly after SLT cast to find out how many people are inside the link when spouting spirits would heal
    if (spellId === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id && this.spiritLinkCastTimestamp <= event.timestamp - linkBufferStart && this.spiritLinkCastTimestamp >= event.timestamp - linkBufferEnd) {
      this.potentialSpoutingSpiritsTargets += 1;
    }
  }

  get surgingTideProcsPerMinute() {
    return (this.potentialSurgingTideProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(2);
  }
  get spoutingSpiritsHits() {
    return this.potentialSpoutingSpiritsTargets;
  }
  get overflowingShoresHits() {
    return this.potentialOverflowingShoresTargets;
  }
}

export default Spreadsheet;
