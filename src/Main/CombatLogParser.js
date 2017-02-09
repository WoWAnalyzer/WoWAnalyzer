const SPELL_ID_RULE_OF_LAW = 214202;

const ABILITIES_AFFECTED_BY_MASTERY = [
  225311, // Light of Dawn
  20473, // Holy Shock
  82326, // Holy Light
  19750, // Flash of Light
  196917, // Light of the Martyr
  114165, // Holy Prism
  114158, // Light's Hammer
  183811, // Judgment of Light
  200652, // Tyr's Deliverance
  223306, // Bestow Faith
];

class CombatLogParser {
  lastCast = null;
  lastRuleOfLaw = null;
  // Tracking total healing seen as a sanity check
  totalHealing = 0;

  players = {};
  masteryHealEvents = [];

  player = null;
  playerMasteryPerc = null;
  fight = null;

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
      if (!this.lastCast) {
        console.error('Received a heal before we detected a cast. Can\'t process since player location is still unknown.', event);
        return;
      } else if (this.playerMasteryPerc === null) {
        console.error('Received a heal before finding out player\'s mastery percentage.', event);
        return;
      }
      const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.indexOf(event.ability.guid) !== -1;

      // The actual heal as shown in the log
      const healingDone = event.amount;

      if (isAbilityAffectedByMastery) {
        // console.log(event.ability.name,
        //   `healing:${event.amount},distance:${distance},hasRuleOfLaw:${hasRuleOfLaw},masteryEffectiveness:${masteryEffectiveness}`,
        //   `playerMasteryPerc:${this.playerMasteryPerc}`, event);

        const distance = CombatLogParser.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
        const hasRuleOfLaw = this.lastRuleOfLaw !== null;
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
      this.totalHealing += healingDone;
    }
  }
  parse_applybuff(event) {
    if (!this.byPlayer(event)) return;

    const { ability: { guid } } = event;
    if (guid === SPELL_ID_RULE_OF_LAW) {
      this.lastRuleOfLaw = event;
    }
  }
  parse_refreshbuff(event) {
    if (!this.byPlayer(event)) return;

    const { ability: { guid } } = event;
    if (guid === SPELL_ID_RULE_OF_LAW) {
      this.lastRuleOfLaw = event;
    }
  }
  parse_removebuff(event) {
    if (!this.byPlayer(event)) return;

    const { ability: { guid } } = event;
    if (guid === SPELL_ID_RULE_OF_LAW) {
      this.lastRuleOfLaw = null;
    }
  }
  parse_combatantinfo(event) {
    console.log('combatantinfo', event, `(looking for ${this.player.id})`, this.player);

    this.players[event.sourceID] = event;

    if (this.byPlayer(event)) {
      this.playerMasteryPerc = CombatLogParser.calculateMasteryPercentage(event.mastery);
    }
  }
  parse_absorbed(event) {
    if (this.byPlayer(event)) {
      this.totalHealing += event.amount;
    }
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
