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
  totalActualMasteryHealing = 0;
  // The total (so from all abilities) max potential mastery healing if we had a mastery effectiveness of 100% on all abilities. This does NOT include the base healing
  // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
  totalMaxPotentialMasteryHealing = 0;
  // Tracking total healing seen as a sanity check
  totalHealingSeen = 0;

  players = {};

  player = null;
  playerMasteryPerc = null;
  fight = null;

  constructor(player, fight) {
    this.player = player;
    this.fight = fight;
  }

  // results = [];

  parseEvents(events) {
    // console.log('Received events', events);
    return new Promise((resolve, reject) => {
      events.forEach(event => {
        // Report all events
        // console.log(Math.round(event.timestamp / 100) / 10, event.type, [event.x, event.y], event.sourceID, event);
        const methodName = `parse_${event.type}`;
        const method = this[methodName];
        if (method) {

          method.call(this, event);
        } else {
          // Report unrecognized events
          // console.warn("Didn't recognize", event.type, event.ability && event.ability.name, event);
        }
      });

      resolve({
        totalActualMasteryHealing: this.totalActualMasteryHealing,
        totalMaxPotentialMasteryHealing: this.totalMaxPotentialMasteryHealing,
        totalHealingSeen: this.totalHealingSeen,
      });
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
    if (this.byPlayer(event)) {
      if (!this.lastCast) {
        console.error('Received a heal before we detected a cast. Can\'t process since player location is still unknown.', event);
        return;
      }
      const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.indexOf(event.ability.guid) !== -1;

      // The actual heal as shown in the log
      const healingDone = event.amount;

      if (isAbilityAffectedByMastery) {
        // TODO: Verify that lastCast x/y usage is accurate, especially questionable for damage events and judgment of light
        const distance = CombatLogParser.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
        const hasRuleOfLaw = this.lastRuleOfLaw !== null;
        // We calculate the mastery effectiveness of this *one* heal
        const masteryEffectiveness = CombatLogParser.calculateMasteryEffectiveness(distance, hasRuleOfLaw);

        // The base healing of the spell (excluding any healing added by mastery)
        const baseHealingDone = healingDone / (1 + this.playerMasteryPerc * masteryEffectiveness);
        const masteryHealingDone = healingDone - baseHealingDone;
        const maxPotentialMasteryHealing = baseHealingDone * this.playerMasteryPerc; // * 100% mastery effectiveness

        // Keep track of the total healing done to get an average
        this.totalActualMasteryHealing += masteryHealingDone;
        this.totalMaxPotentialMasteryHealing += maxPotentialMasteryHealing;

        // If we want to make charts we'll have to keep a log
        // this.results.push({
        //   ...event,
        //   distance,
        //   hasRuleOfLaw,
        //   masteryEffectiveness,
        // });
        // console.log(event.ability.name,
        //   `healing:${event.amount},distance:${distance},hasRuleOfLaw:${hasRuleOfLaw},masteryEffectiveness:${masteryEffectiveness}`,
        //   `playerMasteryPerc:${this.playerMasteryPerc}`, event);
      }
      this.totalHealingSeen += healingDone;
    }
    if (this.toPlayer(event)) {
      this.playerEvent(event);
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
    if (!this.byPlayer(event)) return;

    this.totalHealingSeen += event.amount;
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
    if (distance > 5) {
      const timeSince = event.timestamp - this.lastCast.timestamp;
      console.warn('Distance since previous event (' + (Math.round(timeSince / 100) / 10) + 's ago) was ' + Math.round(distance) + ' yards:', event.type, event, this.lastCast.type, this.lastCast);
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
