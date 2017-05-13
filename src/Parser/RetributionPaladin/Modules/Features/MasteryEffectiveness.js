import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

import { ABILITIES_AFFECTED_BY_MASTERY, BEACON_TYPES } from '../../Constants';

const debug = false;

class MasteryEffectiveness extends Module {
  lastPlayerPositionUpdate = null;
  /** @type {object} With BotLB this will be the position of our beacon target. */
  lastBeaconPositionUpdate = null;

  masteryHealEvents = [];

  hasBeaconOfTheLightbringer = false;
  on_initialized() {
    if (!this.owner.error) {
      this.hasBeaconOfTheLightbringer = this.owner.selectedCombatant.lv100Talent === BEACON_TYPES.BEACON_OF_THE_LIGHTBRINGER;
    }
  }

  on_cast(event) {
    if (this.owner.byPlayer(event)) {
      this.updatePlayerPosition(event);
    }
    if (this.hasBeaconOfTheLightbringer) {
      const beaconPlayerId = this.beaconOfTheLightbringerTarget;
      if (beaconPlayerId === null) {
        // No (valid) target so discard position to prevent an old position from being considered
        this.lastBeaconPositionUpdate = null;
      } else {
        if (this.owner.byPlayer(event, beaconPlayerId)) {
          this.updateBeaconPosition(event);
        }
      }
    }
  }
  on_damage(event) {
    if (this.owner.toPlayer(event)) {
      // Damage coordinates are for the target, so they are only accurate when done TO player
      this.updatePlayerPosition(event);
    }
    if (this.hasBeaconOfTheLightbringer) {
      const beaconPlayerId = this.beaconOfTheLightbringerTarget;
      if (beaconPlayerId === null) {
        // No (valid) target so discard position to prevent an old position from being considered
        this.lastBeaconPositionUpdate = null;
      } else {
        if (this.owner.toPlayer(event, beaconPlayerId)) {
          this.updateBeaconPosition(event);
        }
      }
    }
  }
  on_energize(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
    if (this.hasBeaconOfTheLightbringer) {
      const beaconPlayerId = this.beaconOfTheLightbringerTarget;
      if (beaconPlayerId === null) {
        // No (valid) target so discard position to prevent an old position from being considered
        this.lastBeaconPositionUpdate = null;
      } else {
        if (this.owner.toPlayer(event, beaconPlayerId)) {
          this.updateBeaconPosition(event);
        }
      }
    }
  }
  on_heal(event) {
    if (this.owner.toPlayer(event)) {
      // Do this before checking if this was done by player so that self-heals will apply full mastery properly
      this.updatePlayerPosition(event);
    }
    if (this.hasBeaconOfTheLightbringer) {
      const beaconPlayerId = this.beaconOfTheLightbringerTarget;
      if (beaconPlayerId === null) {
        // No (valid) target so discard position to prevent an old position from being considered
        this.lastBeaconPositionUpdate = null;
      } else {
        if (this.owner.toPlayer(event, beaconPlayerId)) {
          this.updateBeaconPosition(event);
        }
      }
    }

    if (this.owner.byPlayer(event)) {
      this.processForMasteryEffectiveness(event);
    }
  }

  get beaconOfTheLightbringerTarget() {
    const beaconTargets = this.owner.modules.beaconTargets;
    if (beaconTargets.numBeaconsActive === 0) {
      debug && console.log('No beacon active right now');
    } else if (beaconTargets.numBeaconsActive === 1) {
      return beaconTargets.currentBeaconTargets[0];
    } else {
      debug && console.error('Expected a single beacon to be active since we have BotLB, found', beaconTargets.numBeaconsActive);
    }
    return null;
  }

  processForMasteryEffectiveness(event) {
    if (!this.lastPlayerPositionUpdate) {
      console.error('Received a heal before we know the player location. Can\'t process since player location is still unknown.', event);
      return;
    } else if (this.owner.modules.combatants.selected === null) {
      console.error('Received a heal before selected combatant meta data was received.', event);
      return;
    }
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.indexOf(event.ability.guid) !== -1;

    const healingDone = event.amount;

    if (isAbilityAffectedByMastery) {
      // console.log(event.ability.name,
      //   `healing:${event.amount},distance:${distance},isRuleOfLawActive:${isRuleOfLawActive},masteryEffectiveness:${masteryEffectiveness}`,
      //   `playerMasteryPerc:${this.playerMasteryPerc}`, event);

      const distance = this.getDistanceForMastery(event);
      const isRuleOfLawActive = this.owner.selectedCombatant.hasBuff(SPELLS.RULE_OF_LAW_TALENT.id, event.timestamp);
      // We calculate the mastery effectiveness of this *one* heal
      const masteryEffectiveness = this.constructor.calculateMasteryEffectiveness(distance, isRuleOfLawActive);

      // The base healing of the spell (excluding any healing added by mastery)
      const baseHealingDone = healingDone / (1 + this.owner.modules.combatants.selected.masteryPercentage * masteryEffectiveness);
      const masteryHealingDone = healingDone - baseHealingDone;
      // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
      // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
      const maxPotentialMasteryHealing = baseHealingDone * this.owner.modules.combatants.selected.masteryPercentage; // * 100% mastery effectiveness

      this.masteryHealEvents.push({
        ...event,
        distance,
        masteryEffectiveness,
        baseHealingDone,
        masteryHealingDone,
        maxPotentialMasteryHealing,
      });
    }
  }
  getDistanceForMastery(event) {
    let distance = this.getPlayerDistance(event);
    if (this.hasBeaconOfTheLightbringer && this.lastBeaconPositionUpdate) {
      distance = Math.min(distance, this.getBeaconDistance(event));
    }

    return distance;
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.verifyPlayerPositionUpdate(event, this.lastPlayerPositionUpdate, 'player');
    this.lastPlayerPositionUpdate = event;
  }
  updateBeaconPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.verifyPlayerPositionUpdate(event, this.lastBeaconPositionUpdate, 'beacon');
    this.lastBeaconPositionUpdate = event;
  }
  verifyPlayerPositionUpdate(event, lastPositionUpdate, forWho) {
    if (!event.x || !event.y || !lastPositionUpdate) {
      return;
    }
    const distance = this.constructor.calculateDistance(lastPositionUpdate.x, lastPositionUpdate.y, event.x, event.y);
    const timeSince = event.timestamp - lastPositionUpdate.timestamp;
    const maxDistance = Math.max(1, timeSince / 1000 * 10 * 1.5); // 10 yards per second + 50% margin of error
    if (distance > maxDistance) {
      debug && console.warn(forWho, 'distance since previous event (' + (Math.round(timeSince / 100) / 10) + 's ago) was ' + (Math.round(distance * 10) / 10) + ' yards:', event.type, event, lastPositionUpdate.type, lastPositionUpdate);
    }
  }

  getPlayerDistance(event) {
    return this.constructor.calculateDistance(this.lastPlayerPositionUpdate.x, this.lastPlayerPositionUpdate.y, event.x, event.y);
  }
  getBeaconDistance(event) {
    return this.constructor.calculateDistance(this.lastBeaconPositionUpdate.x, this.lastBeaconPositionUpdate.y, event.x, event.y);
  }
  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }
  static calculateMasteryEffectiveness(distance, isRuleOfLawActive) {
    const fullEffectivenessRadius = isRuleOfLawActive ? 15 : 10;
    const falloffRadius = isRuleOfLawActive ? 60 : 40;

    return Math.min(1, Math.max(0, 1 - (distance - fullEffectivenessRadius) / (falloffRadius - fullEffectivenessRadius)));
  }
}

export default MasteryEffectiveness;
