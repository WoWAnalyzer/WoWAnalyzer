export const SPELL_ID_RULE_OF_LAW = 214202;

const HOLY_SHOCK_SPELL_ID = 25914;
const ABILITIES_AFFECTED_BY_MASTERY = [
  225311, // Light of Dawn (heal)
  85222, // Light of Dawn (cast)
  HOLY_SHOCK_SPELL_ID, // Holy Shock (heal)
  20473, // Holy Shock (cast)
  82326, // Holy Light
  19750, // Flash of Light
  183998, // Light of the Martyr (WCL)
  196917, // Light of the Martyr
  114852, // Holy Prism (heal)
  114165, // Holy Prism (cast)
  119952, // Light's Hammer (heal)
  114158, // Light's Hammer (cast)
  183811, // Judgment of Light (heal)
  200654, // Tyr's Deliverance (heal)
  200652, // Tyr's Deliverance (cast)
  223306, // Bestow Faith
];
const TRAITS = {
  SHOCK_TREATMENT: 200315,
};
const TALENTS = {
  LV30: 1,
};
const GEAR_SLOTS = {
  CLOAK: 14,
};
const DRAPE_OF_SHAME_ID = 142170;
const DRAPE_OF_SHAME_CRIT_EFFECT = 0.1;
const HIT_TYPES = {
  NORMAL: 1,
  CRIT: 2,
  NOCLUEWHATTHISIS: 3, // seen at Aura of Sacrifice
};

class CombatLogParser {
  lastCast = null;
  // Tracking total healing seen as a sanity check
  totalHealing = 0;

  players = {};
  masteryHealEvents = [];
  drapeHealing = 0;
  hasDrapeOfShame = false;
  hasRuleOfLaw = false;
  traits = {};

  player = null;
  playerMasteryPerc = null;
  fight = null;

  get fightDuration() {
    return this.fight.end_time - this.fight.start_time;
  }

  constructor(player, fight) {
    this.player = player;
    this.fight = fight;
  }

  parseEvents(events) {
    return new Promise((resolve, reject) => {
      events.forEach(event => {
        const methodName = `parse_${event.type}`;
        const method = this[methodName];
        if (method) {
          method.call(this, event);
        } else {
          // Report unrecognized events
          // console.warn("Didn't recognize", event.type, event.ability && event.ability.name, event);
        }
      });

      resolve(events.length);
    });
  }

  parse_cast(event) {
    if (this.byPlayer(event)) {
      this.playerEvent(event);
    }
  }
  parse_damage(event) {
    if (this.toPlayer(event)) {
      // Damage coordinates are for the target, so they are only accurate when done TO player
      this.playerEvent(event);
    }
  }
  parse_energize(event) {
    if (this.toPlayer(event)) {
      this.playerEvent(event);
    }
  }
  parse_heal(event) {
    if (this.toPlayer(event)) {
      // Do this before checking if this was done by player so that self-heals will apply full mastery properly
      this.playerEvent(event);
    }
    if (this.byPlayer(event)) {
      this.processForMasteryEffectiveness(event);
      this.processForDrapeOfShameHealing(event);

      // event.amount is the actual heal as shown in the log
      this.totalHealing += event.amount;
    }
  }
  parse_combatantinfo(event) {
    console.log('combatantinfo', event);

    this.players[event.sourceID] = event;

    if (this.byPlayer(event)) {
      this.playerMasteryPerc = CombatLogParser.calculateMasteryPercentage(event.mastery);

      event.auras.forEach(aura => {
        this.applyActiveBuff({
          ability: {
            abilityIcon: aura.icon,
            guid: aura.ability,
          },
          sourceID: aura.source,
        });
      });

      this.hasRuleOfLaw = event.talents[TALENTS.LV30] && event.talents[TALENTS.LV30].id === SPELL_ID_RULE_OF_LAW;
      this.hasDrapeOfShame = event.gear[GEAR_SLOTS.CLOAK] && event.gear[GEAR_SLOTS.CLOAK].id === DRAPE_OF_SHAME_ID;
      this.parseTraits(event.artifact);
    }
  }
  parseTraits(traits) {
    traits.forEach(({ spellID, rank }) => {
      this.traits[spellID] = rank;
    });
  }
  parse_absorbed(event) {
    if (this.byPlayer(event)) {
      this.totalHealing += event.amount;
    }
  }

  processForMasteryEffectiveness(event) {
    if (!this.lastCast) {
      console.error('Received a heal before we detected a cast. Can\'t process since player location is still unknown.', event);
      return;
    } else if (this.playerMasteryPerc === null) {
      console.error('Received a heal before finding out player\'s mastery percentage.', event);
      return;
    }
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.indexOf(event.ability.guid) !== -1;

    const healingDone = event.amount;

    if (isAbilityAffectedByMastery) {
      // console.log(event.ability.name,
      //   `healing:${event.amount},distance:${distance},hasRuleOfLaw:${hasRuleOfLaw},masteryEffectiveness:${masteryEffectiveness}`,
      //   `playerMasteryPerc:${this.playerMasteryPerc}`, event);

      const distance = CombatLogParser.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
      const hasRuleOfLaw = this.hasBuff(SPELL_ID_RULE_OF_LAW);
      // We calculate the mastery effectiveness of this *one* heal
      const masteryEffectiveness = CombatLogParser.calculateMasteryEffectiveness(distance, hasRuleOfLaw);

      // The base healing of the spell (excluding any healing added by mastery)
      const baseHealingDone = healingDone / (1 + this.playerMasteryPerc * masteryEffectiveness);
      const masteryHealingDone = healingDone - baseHealingDone;
      // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
      // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
      const maxPotentialMasteryHealing = baseHealingDone * this.playerMasteryPerc; // * 100% mastery effectiveness

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
  processForDrapeOfShameHealing(event) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    let critModifier = 2 + DRAPE_OF_SHAME_CRIT_EFFECT;

    if (event.ability.guid === HOLY_SHOCK_SPELL_ID) {
      const shockTreatmentTraits = this.traits[TRAITS.SHOCK_TREATMENT];
      // Shock Treatment increases critical healing of Holy Shock by 8%: http://www.wowhead.com/spell=200315/shock-treatment
      // This critical healing works on both the regular part and the critical part (unlike Drape of Shame), so we double it.
      critModifier += shockTreatmentTraits * 0.08 * 2;
    }

    const amount = event.amount;
    const overheal = event.overheal || 0;
    const raw = amount + overheal;
    const rawNormalPart = raw / critModifier;
    const rawDrapeHealing = rawNormalPart * DRAPE_OF_SHAME_CRIT_EFFECT;

    const drapeHealing = Math.max(0, rawDrapeHealing - overheal);

    this.drapeHealing += drapeHealing;
  }

  byPlayer(event) {
    return (event.sourceID === this.player.id);
  }
  toPlayer(event) {
    return (event.targetID === this.player.id);
  }
  playerEvent(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.verifyCast(event);
    this.lastCast = event;
  }
  verifyCast(event) {
    if (!event.x || !event.y || !this.lastCast) {
      return;
    }
    const distance = CombatLogParser.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
    const timeSince = event.timestamp - this.lastCast.timestamp;
    const maxDistance = Math.max(1, timeSince / 1000 * 10 * 1.1); // 10 yards per second + 10% margin of error
    if (distance > maxDistance) {
      console.warn('Distance since previous event (' + (Math.round(timeSince / 100) / 10) + 's ago) was ' + (Math.round(distance * 10) / 10) + ' yards:', event.type, event, this.lastCast.type, this.lastCast);
    }
  }

  // region Buffs

  /**
   * Contains all buffs which are active right now.
   * @type {Array}
   */
  activeBuffs = [];
  /**
   * Keeps track of all buffs that have been applied during the fight.
   * @type {Array}
   */
  buffHistory = [];

  hasBuff(buffAbilityId) {
    return this.activeBuffs.find(buff => buff.ability.guid === buffAbilityId) !== undefined;
  }
  getBuffUptime(buffAbilityId) {
    return this.buffHistory.reduce((uptime, buff) => {
      if (buff.ability.guid === buffAbilityId) {
        uptime += buff.uptime;
      }
      return uptime;
    }, 0);
  }

  applyActiveBuff(buff) {
    this.activeBuffs.push(buff);
  }
  removeActiveBuff(activeBuff) {
    const activeBuffIndex = this.activeBuffs.findIndex(buff => buff.ability.guid === activeBuff.ability.guid);
    let appliedAtTimestamp = null;
    if (activeBuffIndex !== -1) {
      const removedBuff = this.activeBuffs.splice(activeBuffIndex, 1)[0];
      appliedAtTimestamp = removedBuff.timestamp;
    } else {
      console.error('Tried to remove buff', activeBuff, ', but couldn\'t find it in activeBuffs.');
      appliedAtTimestamp = this.fight.start_time;
    }

    this.buffHistory.push({
      ...activeBuff,
      uptime: activeBuff.timestamp - appliedAtTimestamp,
    });
  }

  parse_applybuff(event) {
    if (!this.toPlayer(event)) return;

    this.applyActiveBuff(event);
  }
  parse_refreshbuff(event) {
    if (!this.toPlayer(event)) return;

    this.removeActiveBuff(event);
    this.applyActiveBuff(event);
  }
  parse_removebuff(event) {
    if (!this.toPlayer(event)) return;

    this.removeActiveBuff(event);
  }

  // endregion

  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
  static calculateMasteryEffectiveness(distance, hasRuleOfLaw) {
    const fullEffectivenessRadius = hasRuleOfLaw ? 15 : 10;
    const falloffRadius = hasRuleOfLaw ? 60 : 40;

    return Math.min(1, Math.max(0, 1 - (distance - fullEffectivenessRadius) / (falloffRadius - fullEffectivenessRadius)));
  }
  static calculateMasteryPercentage(masteryRating) {
    return 0.12 + masteryRating / 26667;
  }
}

export default CombatLogParser;
