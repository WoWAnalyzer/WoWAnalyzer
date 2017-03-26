import Module from './Module';

import { BEACON_TRANSFER_SPELL_ID, ABILITIES_AFFECTED_BY_MASTERY, RULE_OF_LAW_SPELL_ID, BEACON_TRANSFERING_ABILITIES, BEACON_TYPES, HIT_TYPES, HOLY_SHOCK_SPELL_ID, FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_SPELL_ID, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, LIGHT_OF_THE_MARTYR_SPELL_ID, T19_4SET_BUFF_ID } from './Constants';

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
      this.processForBeaconHealing(event);
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
  beaconTransferEnabledHealsBacklog = [];
  processForBeaconHealing(event) {
    const spellId = event.ability.guid;
    if (spellId === BEACON_TRANSFER_SPELL_ID) {
      this.processBeaconHealing(event);
    }
    const beaconTransferFactor = BEACON_TRANSFERING_ABILITIES[spellId];
    if (!beaconTransferFactor) {
      return;
    }

    const remainingBeaconTransfers = this.beaconType === BEACON_TYPES.BEACON_OF_FATH ? 2 : 1;
    // TODO: Check if the target of this event had a beacon, in that case reduce remainingBeaconTransfers by 1

    this.beaconTransferEnabledHealsBacklog.push({
      ...event,
      beaconTransferFactor,
      remainingBeaconTransfers,
    });
  }
  processBeaconHealing(beaconTransferEvent) {
    // This should make it near impossible to match the wrong spells as we usually don't cast multiple heals within 500ms while the beacon transfer usually happens within 100ms
    this.beaconTransferEnabledHealsBacklog = this.beaconTransferEnabledHealsBacklog.filter(healEvent => (this.owner.currentTimestamp - healEvent.timestamp) < 500);

    const beaconTransferAmount = beaconTransferEvent.amount;
    const beaconTransferAbsorbed = beaconTransferEvent.absorbed || 0;
    const beaconTransferOverheal = beaconTransferEvent.overheal || 0;
    const beaconTransferRaw = beaconTransferAmount + beaconTransferAbsorbed + beaconTransferOverheal;
    const index = this.beaconTransferEnabledHealsBacklog.findIndex((healEvent) => {
      const amount = healEvent.amount;
      const absorbed = healEvent.absorbed || 0;
      const overheal = healEvent.overheal || 0;
      const raw = amount + absorbed + overheal;
      const expectedBeaconTransfer = Math.round(raw * this.beaconTransferFactor * healEvent.beaconTransferFactor);

      return Math.abs(expectedBeaconTransfer - beaconTransferRaw) <= 1; // allow for rounding errors on Blizzard's end
    });

    const hasMatch = index !== -1;
    if (!hasMatch) {
      // Here's a fun fact for you. Fury Warriors with the legendary "Kazzalax, Fujieda's Fury" (http://www.wowhead.com/item=137053/kazzalax-fujiedas-fury)
      // get a 8% healing received increase for almost the entire fight (tooltip states it's 1%, this is a tooltip bug). What's messed up
      // is that this healing increase doesn't beacon transfer. So we won't be able to recognize the heal in here since it's off by 8%, so
      // this will be triggered. While I could implement code to track it, I chose not to because things would get way more complicated and
      // fragile and the accuracy loss for not including this kind of healing is minimal. I expect other healing received increases likely
      // also don't beacon transfer, but right now this isn't common. Fury warrior log:
      // https://www.warcraftlogs.com/reports/TLQ14HfhjRvNrV2y/#view=events&type=healing&source=10&start=7614145&end=7615174&fight=39
      console.error('Failed to match', beaconTransferEvent, 'to a heal. Healing backlog:', this.beaconTransferEnabledHealsBacklog);
    } else {
      const matchedHeal = this.beaconTransferEnabledHealsBacklog[index];
      // console.log('Matched beacon transfer', beaconTransferEvent, 'to heal', matchedHeal);
      this.owner.triggerEvent('beacon_heal', {
        beaconTransferEvent,
        matchedHeal,
      });

      matchedHeal.remainingBeaconTransfers -= 1;
      if (matchedHeal.remainingBeaconTransfers < 1) {
        this.beaconTransferEnabledHealsBacklog.splice(index, 1);
      }
    }
  }
  get beaconType() {
    return this.owner.modules.combatants.selected.lv100Talent;
  }
  get beaconTransferFactor() {
    return this.beaconType === BEACON_TYPES.BEACON_OF_FATH ? 0.32 : 0.4;
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
