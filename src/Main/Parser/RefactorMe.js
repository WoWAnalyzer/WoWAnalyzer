import Module from './Module';

import { ABILITIES_AFFECTED_BY_MASTERY, RULE_OF_LAW_SPELL_ID, HIT_TYPES, HOLY_SHOCK_SPELL_ID, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, LIGHT_OF_THE_MARTYR_SPELL_ID, T19_4SET_BUFF_ID } from './Constants';

class RefactorMe extends Module {
  lastCast = null;
  // Tracking total healing seen as a sanity check
  totalHealing = 0;

  masteryHealEvents = [];

  casts = {
    flashOfLight: 0,
    holyLight: 0,
    flashOfLightWithIol: 0,
    holyLightWithIol: 0,
    flashOfLightOnBeacon: 0,
    holyLightOnBeacon: 0,
    lightOfTheMartyr: 0,
    holyShock: 0,
    holyShockCriticals: 0,
  };

  parse_cast(event) {
    if (this.owner.byPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }
  parse_damage(event) {
    if (this.owner.toPlayer(event)) {
      // Damage coordinates are for the target, so they are only accurate when done TO player
      this.updatePlayerPosition(event);
    }
  }
  parse_energize(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }
  parse_heal(event) {
    if (this.owner.toPlayer(event)) {
      // Do this before checking if this was done by player so that self-heals will apply full mastery properly
      this.updatePlayerPosition(event);
    }
    if (this.owner.byPlayer(event)) {
      this.processForMasteryEffectiveness(event);
      this.processForCastRatios(event);

      // event.amount is the actual heal as shown in the log
      this.totalHealing += event.amount;
    }
  }
  parse_absorbed(event) {
    if (this.owner.byPlayer(event)) {
      this.totalHealing += event.amount;
    }
  }
  // TODO: Damage taken from LOTM

  processForMasteryEffectiveness(event) {
    if (!this.lastCast) {
      console.error('Received a heal before we detected a cast. Can\'t process since player location is still unknown.', event);
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

      const distance = this.constructor.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
      const isRuleOfLawActive = this.owner.modules.buffs.hasBuff(RULE_OF_LAW_SPELL_ID);
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
  processForCastRatios(event) {
    const spellId = event.ability.guid;

    if (spellId === HOLY_SHOCK_SPELL_ID) {
      this.casts.holyShock += 1;
      if (event.hitType === HIT_TYPES.CRIT) {
        this.casts.holyShockCriticals += 1;
      }
    } else if (spellId === FLASH_OF_LIGHT_SPELL_ID || spellId === HOLY_LIGHT_SPELL_ID) {
      const hasIol = this.owner.modules.buffs.hasBuff(INFUSION_OF_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER);
      // TODO: target hasBeaconOfLight

      switch (spellId) {
        case FLASH_OF_LIGHT_SPELL_ID:
          this.casts.flashOfLight += 1;
          if (hasIol) {
            this.casts.flashOfLightWithIol += 1;
          }
          break;
        case HOLY_LIGHT_SPELL_ID:
          this.casts.holyLight += 1;
          if (hasIol) {
            this.casts.holyLightWithIol += 1;
          }
          break;
        default: break;
      }
    } else if (spellId === LIGHT_OF_THE_MARTYR_SPELL_ID) {
      this.casts.lightOfTheMartyr += 1;
    }
  }
  get iolProcsPerHolyShockCrit() {
    return this.owner.modules.buffs.hasBuff(T19_4SET_BUFF_ID) ? 2 : 1;
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.verifyPlayerPositionUpdate(event);
    this.lastCast = event;
  }
  verifyPlayerPositionUpdate(event) {
    if (!event.x || !event.y || !this.lastCast) {
      return;
    }
    const distance = this.constructor.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
    const timeSince = event.timestamp - this.lastCast.timestamp;
    const maxDistance = Math.max(1, timeSince / 1000 * 10 * 1.1); // 10 yards per second + 10% margin of error
    if (distance > maxDistance) {
      console.warn('Distance since previous event (' + (Math.round(timeSince / 100) / 10) + 's ago) was ' + (Math.round(distance * 10) / 10) + ' yards:', event.type, event, this.lastCast.type, this.lastCast);
    }
  }

  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
  static calculateMasteryEffectiveness(distance, isRuleOfLawActive) {
    const fullEffectivenessRadius = isRuleOfLawActive ? 15 : 10;
    const falloffRadius = isRuleOfLawActive ? 60 : 40;

    return Math.min(1, Math.max(0, 1 - (distance - fullEffectivenessRadius) / (falloffRadius - fullEffectivenessRadius)));
  }
}

export default RefactorMe;
