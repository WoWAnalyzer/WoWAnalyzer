import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

import { ABILITIES_NOT_FEEDING_INTO_AG, ABILITIES_NOT_FEEDING_INTO_ASCENDANCE, ABILITIES_NOT_FEEDING_INTO_CBT } from '../../Constants';

// The purpose of this class is threefold:
// 1) provide cooldown data for the cooldowns tab. I had to rewrite some of the functions because
// cloudburst totem does not appear as a buff in the combat log.
// 2) Track the spells feeding into AG/Asc/CBT so we can provide a breakdownn of the feeding
// for the Feeding tab.
// 3) Generate feed_heal events to be used for statweights.
//
// For each active AG/CBT/Asc we track for each spell how much raw- and effective healing it
// contributed. Whenever new results are generated in CombatLogParser.js processAll will
// be called. This function looks through all cooldowns that have not been processed yet
// and adds their healing to the total spell breakdown per cooldown, which is stored in
// cbtFeed, agFeed and ascFeed. It is necessary to do it this way because only after
// cloudburst has done all its healing you know how much overhealing it has done, and
// thus how much effective healing each of the feeding spells did.
//
// getIndirectHealing can be used to query for one spellId how much healing it provided
// through AG/CBT/Asc.

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.ANCESTRAL_GUIDANCE_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
    {
      spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  cbtFeed = [];
  cbtTotals = { total: 0, totalEffective: 0 };

  agFeed = [];
  agTotals = { total: 0, totalEffective: 0 };

  ascFeed = [];
  ascTotals = { total: 0, totalEffective: 0 };

  hasBeenCBTHealingEvent = false;
  hasBeenAGHealingOrCastEvent = false;
  hasBeenAscHealingOrCastEvent = false;

  processAll() {
    this.pastCooldowns
      .filter(cooldown => cooldown.end && !cooldown.processed)
      .forEach((cooldown) => {
        let feed = null;
        let totals = null;
        let feedingFactor = 0;
        if (cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
          feed = this.cbtFeed;
          totals = this.cbtTotals;
          feedingFactor = 0.25;
        } else if (cooldown.spell.id === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id) {
          feed = this.agFeed;
          totals = this.agTotals;
          feedingFactor = 0.6;
        } else if (cooldown.spell.id === SPELLS.ASCENDANCE_TALENT_RESTORATION.id) {
          feed = this.ascFeed;
          totals = this.ascTotals;
          feedingFactor = 1.0;
        }

        let percentOverheal = 0;
        if ((cooldown.healing + cooldown.overheal) > 0) {
          percentOverheal = cooldown.overheal / (cooldown.healing + cooldown.overheal);
        }

        Object.keys(cooldown.feed).forEach((spellId) => {
          spellId = Number(spellId);
          if (!feed[spellId]) {
            feed[spellId] = [];
            feed[spellId].healing = 0;
            feed[spellId].effectiveHealing = 0;
            feed[spellId].name = cooldown.feed[spellId].name;
            feed[spellId].icon = cooldown.feed[spellId].icon;
          }
          const rawHealing = cooldown.feed[spellId].healing;
          const effectiveHealing = rawHealing * (1 - percentOverheal) * feedingFactor;
          feed[spellId].healing += rawHealing;
          feed[spellId].effectiveHealing += effectiveHealing;
          totals.total += rawHealing;
          totals.totalEffective += effectiveHealing;
        });

        // if this cooldown is CBT, check if it ended while AG was active
        // if so, 60% of CBT got redistributed again so we multiply the feeding factor by 1.6
        let ancestralGuidanceSynergy = 1;
        if (cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
          this.pastCooldowns
            .filter(_cooldown => _cooldown.end && _cooldown.spell.id === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id)
            .forEach((_cooldown) => {
              if (cooldown.end >= _cooldown.start && cooldown.end <= _cooldown.end) {
                const ancestralGuidanceOverheal = _cooldown.overheal / (_cooldown.healing + _cooldown.overheal);
                ancestralGuidanceSynergy += (0.6 * (1 - ancestralGuidanceOverheal));
              }
            });
        }

        this.generateFeedEvents(cooldown, feedingFactor * ancestralGuidanceSynergy, percentOverheal);

        cooldown.processed = true;
      });
  }

  // Fabricate new events to make it easy to listen to just feed heal events while being away of the original heals. 
  // While we could also modify the original heal event and add a reference to the feed amount, this would be less clean as mutating objects makes things harder and more confusing to use, and may lead to conflicts.
  // Due to how the Shaman CooldonwThroughputTracker works, these events will be bunched together at the very end of the events list.
  generateFeedEvents(cooldown, feedingFactor, percentOverheal){
    cooldown.events.forEach((event) => {
      if (event.type !== 'heal' || !cooldown.feed[event.ability.guid]) {
        return;
      }

      // skipping all the events that do not get treated anyway, helping calculation time and removing a lot of fabricated event spam
      if (event.ability.guid === SPELLS.ASCENDANCE_HEAL.id || event.ability.guid === SPELLS.ANCESTRAL_GUIDANCE_HEAL.id || event.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
        return;
      }

      // if this cooldown is Ascendance, check if the same heal event is in any AG cooldown, and if so, adjust the feeding factor to account for double dipping
      let ancestralGuidanceSynergy = 1;
      if (cooldown.spell.id === SPELLS.ASCENDANCE_TALENT_RESTORATION.id) {
        this.pastCooldowns
          .filter(_cooldown => _cooldown.end && _cooldown.spell.id === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id)
          .forEach((_cooldown) => {
            if (event.timestamp >= _cooldown.start && event.timestamp <= _cooldown.end) {
              const ancestralGuidanceOverheal = _cooldown.overheal / (_cooldown.healing + _cooldown.overheal);
              ancestralGuidanceSynergy += (0.6 * (1 - ancestralGuidanceOverheal));
            }
          });
      }

      const eventFeed = ((event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0)) * feedingFactor * ancestralGuidanceSynergy * (1-percentOverheal);

      this.owner.fabricateEvent({
        ...event,
        type: 'feed_heal',
        feed: eventFeed,
        __fabricated: true,
      }, cooldown.spell);
    });
  }

  getIndirectHealing(spellId) {
    let healing = 0;
    if (this.cbtFeed[spellId]) {
      healing += this.cbtFeed[spellId].effectiveHealing || 0;
    }

    if (this.agFeed[spellId]) {
      healing += this.agFeed[spellId].effectiveHealing || 0;
    }

    if (this.ascFeed[spellId]) {
      healing += this.ascFeed[spellId].effectiveHealing || 0;
    }

    return healing;
  }

  addNewCooldown(spell, timestamp) {
    const cooldown = {
      ...spell,
      start: timestamp,
      end: null,
      processed: false,
      healing: 0,
      overheal: 0,
      feed: [],
      events: [],
    };

    this.pastCooldowns.push(cooldown);
    this.activeCooldowns.push(cooldown);

    return cooldown;
  }

  popCBT(event) {
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id);
    if (index === -1) {
      return;
    }
    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
  }

  on_initialized() {
    // Store cooldown info in case it was cast before pull. If we see a cast before it expires, all data in it is discarded.
    this.lastCBT = this.addNewCooldown({
      spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    }, this.owner.fight.start_time);
    this.lastAG = this.addNewCooldown({
      spell: SPELLS.ANCESTRAL_GUIDANCE_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    }, this.owner.fight.start_time);
    this.lastAsc = this.addNewCooldown({
      spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    }, this.owner.fight.start_time);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const spell = this.constructor.cooldownSpells.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (!spell) {
      return;
    }

    // If the AG/Asc we stored on pull is still up, discard all data in it.
    if ((spellId === SPELLS.ASCENDANCE_TALENT_RESTORATION.id || spellId === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id)) {
      if (this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === spellId) !== -1) {
        this.removeLastCooldown(spellId);
      }
    }

    const cooldown = this.addNewCooldown(spell, event.timestamp);

    if (spellId === SPELLS.ASCENDANCE_TALENT_RESTORATION.id) {
      this.lastAsc = cooldown;
      this.hasBeenAscHealingOrCastEvent = true;
    }
    if (spellId === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id) {
      this.lastAG = cooldown;
      this.hasBeenAGHealingOrCastEvent = true;
    }
  }

  on_finished() {
    if (!this.hasBeenAscHealingOrCastEvent && this.lastAsc) {
      this.removeLastCooldown(SPELLS.ASCENDANCE_TALENT_RESTORATION.id);
    }

    if (!this.hasBeenAGHealingOrCastEvent && this.lastAG) {
      this.removeLastCooldown(SPELLS.ANCESTRAL_GUIDANCE_TALENT.id);
    }

    if (!this.hasBeenCBTHealingEvent && this.lastCBT) {
      this.removeLastCooldown(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
    }

    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;

      // If cloudburst is still up at the end of the fight, it didn't do any healing, so dont process it.
      if (cooldown.spell.id === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
        cooldown.processed = true;
      }
    });
    this.activeCooldowns = [];

    this.processAll();
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
      if (!this.hasBeenCBTHealingEvent) {
        // If the CBT we stored on pull is still up, discard all data in it.
        this.removeLastCooldown(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
      }
      this.lastCBT = this.addNewCooldown({
        spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
        summary: [
          BUILT_IN_SUMMARY_TYPES.HEALING,
          BUILT_IN_SUMMARY_TYPES.OVERHEALING,
          BUILT_IN_SUMMARY_TYPES.MANA,
        ],
      }, event.timestamp);
    }

    super.on_byPlayer_cast(event);
  }

  removeLastCooldown(spellId) {
    const indexactiveCooldowns = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === spellId);

    const reverseIndexCooldowns = [...this.pastCooldowns].reverse().findIndex(cooldown => cooldown.spell.id === spellId);
    const indexCooldowns = this.pastCooldowns.length - reverseIndexCooldowns - 1;

    if (indexactiveCooldowns !== -1 && indexCooldowns !== -1) {
      this.activeCooldowns.splice(indexactiveCooldowns, 1);
      this.pastCooldowns.splice(indexCooldowns, 1);
    }
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id && this.lastCBT) {
      this.hasBeenCBTHealingEvent = true;
      this.popCBT(event);
      this.lastCBT.healing += (event.amount || 0) + (event.absorbed || 0);
      this.lastCBT.overheal += (event.overheal || 0);
    } else if (event.ability.guid === SPELLS.ANCESTRAL_GUIDANCE_HEAL.id && this.lastAG) {
      this.hasBeenAGHealingOrCastEvent = true;
      this.lastAG.healing += (event.amount || 0) + (event.absorbed || 0);
      this.lastAG.overheal += (event.overheal || 0);
    } else if (event.ability.guid === SPELLS.ASCENDANCE_HEAL.id && this.lastAsc) {
      this.hasBeenAscHealingOrCastEvent = true;
      this.lastAsc.healing += (event.amount || 0) + (event.absorbed || 0);
      this.lastAsc.overheal += (event.overheal || 0);
    }

    const spellId = event.ability.guid;
    const healingDone = (event.amount || 0) + (event.overheal || 0) + (event.absorbed || 0);

    this.activeCooldowns.forEach((cooldown) => {
      const cooldownId = cooldown.spell.id;

      if ((cooldownId === SPELLS.CLOUDBURST_TOTEM_TALENT.id && (ABILITIES_NOT_FEEDING_INTO_CBT.indexOf(spellId) <= -1)) ||
        (cooldownId === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id && (ABILITIES_NOT_FEEDING_INTO_AG.indexOf(spellId) <= -1)) ||
        (cooldownId === SPELLS.ASCENDANCE_TALENT_RESTORATION.id && (ABILITIES_NOT_FEEDING_INTO_ASCENDANCE.indexOf(spellId) <= -1))) {
        if (!cooldown.feed[spellId]) {
          cooldown.feed[spellId] = [];
          cooldown.feed[spellId].healing = 0;
          cooldown.feed[spellId].name = event.ability.name;
          cooldown.feed[spellId].icon = event.ability.abilityIcon;
        }
        cooldown.feed[spellId].healing += healingDone;
      }
      cooldown.events.push(event);
    });
  }

  on_byPlayer_damage(event) {
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id);
    // const spellId = event.ability.guid;

    if (index === -1) {

    }

    // This should probably be done with a white list, too many damage events that do not
    // feed into AG.
    /*
     if (ABILITIES_NOT_FEEDING_INTO_AG.indexOf(spellId) <= -1) {
     if (!this.lastAG.feed[spellId]) {
     this.lastAG.feed[spellId] = [];
     this.lastAG.feed[spellId].healing = 0;
     this.lastAG.feed[spellId].name = event.ability.name;
     this.lastAG.feed[spellId].icon = event.ability.abilityIcon;
     }
     console.log(event)
     this.lastAG.feed[spellId].healing += event.amount;
     //this.agFeed[spellId] = this.agFeed[spellId] || [];
     //this.agFeed[spellId] += (event.amount || 0);
     }
     */
  }

  on_byPlayer_absorbed(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
}

export default CooldownThroughputTracker;
