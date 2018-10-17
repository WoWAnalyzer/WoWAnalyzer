import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import SPELLS from 'common/SPELLS';

const halfHP = 0.5;
const rainBuffer = 2000;
const linkBufferStart = 500;
const linkBufferEnd = 1500;
const totemSpawnDistance = 200; // 2 yards
const ebbAndFlowMinDistance = 8;
const ebbAndFlowMaxDistance = 40;

class Spreadsheet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  potentialSurgingTideProcs = 0;
  potentialOverflowingShoresTargets = 0;
  potentialSpoutingSpiritsTargets = 0;
  healingTideTicks = [];

  spiritLinkCastTimestamp = 0;
  healingRainCastTimestamp = 0;
  healingTidePosition = {};

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SPIRIT_LINK_TOTEM.id) {
      this.spiritLinkCastTimestamp = event.timestamp;
    } else if (spellId === SPELLS.HEALING_TIDE_TOTEM_CAST.id) {
      // totem spawns 2 yards behind and to the right of your position on cast
      const radians = event.facing / 100;
      const xDistance = totemSpawnDistance * Math.cos(radians);
      const yDistance = totemSpawnDistance * Math.sin(radians);

      this.healingTidePosition = {x: event.x + xDistance, y: event.y + yDistance};
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
    } else if (spellId === SPELLS.HEALING_TIDE_TOTEM_HEAL.id) {
      // noone cares about pets
      const combatant = this.combatants.players[event.targetID];
      if (!combatant) {
        return;
      }

      const a = this.healingTidePosition.x - event.x;
      const b = this.healingTidePosition.y - event.y;
      const distanceToPlayer = Math.sqrt(a*a + b*b);

      this.healingTideTicks.push(distanceToPlayer);
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
  get ebbAndFlowEffectiveness() {
    const averageDistance = this.healingTideTicks.reduce((total, tick) => total + tick, 0) / this.healingTideTicks.length / 100;
    // 8 - 40 yards linear falloff
    return Math.min(1 - ((averageDistance - ebbAndFlowMinDistance) / (ebbAndFlowMaxDistance - ebbAndFlowMinDistance)), 1);
  }
}

export default Spreadsheet;
