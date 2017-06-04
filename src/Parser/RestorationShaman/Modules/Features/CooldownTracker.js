import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

import { ABILITIES_NOT_FEEDING_INTO_CBT } from '../../Constants';
import { ABILITIES_NOT_FEEDING_INTO_AG } from '../../Constants';
import { ABILITIES_NOT_FEEDING_INTO_ASCENDANCE } from '../../Constants';

// The purpose of this class is twofold:
// 1) provide cooldown data for the cooldowns tab. I had to rewrite some of the functions because
// cloudburst totem does not appear as a buff in the combat log.
// 2) Track the spells feeding into AG/Asc/CBT so we can provide a breakdownn of the feeding
// for the Feeding tab.
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

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.ANCESTRAL_GUIDANCE_CAST,
    SPELLS.ASCENDANCE_CAST,
  ];


  cbtFeed = [];
  cbtTotals = {total: 0, totalEffective: 0};

  agFeed = [];
  agTotals = {total: 0, totalEffective: 0};

  ascFeed = [];
  ascTotals = {total: 0, totalEffective: 0};

  isCooldownUp(spellId) {
    return this.activeCooldowns.findIndex(cooldown => cooldown.ability.id === spellId) > 1;
  }

  processAll() {
    this.cooldowns
      .filter((cooldown) => cooldown.end && !cooldown.processed)
      .forEach((cooldown) => {
        let feed = null;
        let totals = null;
        let feedingFactor = 0;
        if (cooldown.ability.id === SPELLS.CLOUDBURST_TOTEM_CAST.id) {
            feed = this.cbtFeed;
            totals = this.cbtTotals;
            feedingFactor = 0.25;
        } else if (cooldown.ability.id === SPELLS.ANCESTRAL_GUIDANCE_CAST.id) {
            feed = this.agFeed;
            totals = this.agTotals;
            feedingFactor = 0.6;
        } else if (cooldown.ability.id === SPELLS.ASCENDANCE_CAST.id) {
            feed = this.ascFeed;
            totals = this.ascTotals;
            feedingFactor = 1.0;
        }

        let percentOverheal = 0;
        if ((cooldown.healing + cooldown.overheal) > 0) {
          percentOverheal = cooldown.overheal / (cooldown.healing + cooldown.overheal);
        }

        Object.keys(cooldown.feed).forEach((spellId) => {
          spellId = parseInt(spellId, 10);
          if (!feed[spellId]) {
              feed[spellId] = [];
              feed[spellId].healing = 0;
              feed[spellId].effectiveHealing = 0;
              feed[spellId].name = cooldown.feed[spellId].name;
              feed[spellId].icon = cooldown.feed[spellId].icon;
          }
          const rawHealing = cooldown.feed[spellId].healing;
          const effectiveHealing = rawHealing * (1-percentOverheal) * feedingFactor;
          feed[spellId].healing += rawHealing;
          feed[spellId].effectiveHealing += effectiveHealing;
          totals.total += rawHealing;
          totals.totalEffective += effectiveHealing;
        });


        cooldown.processed = true;
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
      ability: spell,
      start: timestamp,
      end: null,
      processed:  false,
      healing: 0,
      overheal: 0,
      feed: [],
      events: [],
    };

    this.cooldowns.push(cooldown);
    this.activeCooldowns.push(cooldown);

    return cooldown;
  }


  popCBT(event) {
      const index = this.activeCooldowns.findIndex(cooldown => cooldown.ability.id === SPELLS.CLOUDBURST_TOTEM_CAST.id);
      if (index === -1) {
          return;
      }
      const cooldown = this.activeCooldowns[index];
      cooldown.end = event.timestamp;
      this.activeCooldowns.splice(index,1);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const spell = this.constructor.cooldownSpells.find(spell => spell.id === spellId);

    if (!spell) {
      return;
    }

    const cooldown = this.addNewCooldown(spell, event.timestamp);

    if (spellId === SPELLS.ASCENDANCE_CAST.id) {
        this.lastAsc = cooldown;
    }
    if (spellId === SPELLS.ANCESTRAL_GUIDANCE_CAST.id) {
        this.lastAG = cooldown;
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.ability.id === spellId);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
  }


  on_finished() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;

      // If cloudburst is still up at the end of the fight, it didn't do any healing, so dont process it.
      if (cooldown.ability.id === SPELLS.CLOUDBURST_TOTEM_CAST.id) {
        cooldown.processed = true;
      }
    });
    this.activeCooldowns = [];



  }


  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    
    if (spellId === SPELLS.CLOUDBURST_TOTEM_CAST.id) {
        const cbtCooldown = this.addNewCooldown(SPELLS.CLOUDBURST_TOTEM_CAST, event.timestamp);
        this.lastCBT = cbtCooldown;
    }

    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }


  on_byPlayer_heal(event) {
    
      if (event.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
          this.popCBT(event);
          this.lastCBT.healing += (event.amount || 0) + (event.absorb || 0);
          this.lastCBT.overheal += (event.overheal || 0);
      } else if (event.ability.guid === SPELLS.ANCESTRAL_GUIDANCE_HEAL.id) {
          this.lastAG.healing += (event.amount || 0) + (event.absorb || 0);
          this.lastAG.overheal += (event.overheal || 0);
      } else if (event.ability.guid === SPELLS.ASCENDANCE_HEAL.id) {
          this.lastAsc.healing += (event.amount || 0) + (event.absorb || 0);
          this.lastAsc.overheal += (event.overheal || 0);
      }

    const spellId = event.ability.guid;
    const healingDone = (event.amount || 0) + (event.overheal || 0) + (event.absorb || 0);

    this.activeCooldowns.forEach((cooldown) => {
      const cooldownId = cooldown.ability.id;

      if ((cooldownId === SPELLS.CLOUDBURST_TOTEM_CAST.id && (ABILITIES_NOT_FEEDING_INTO_CBT.indexOf(spellId) <= -1)) ||
          (cooldownId === SPELLS.ANCESTRAL_GUIDANCE_CAST.id && (ABILITIES_NOT_FEEDING_INTO_AG.indexOf(spellId) <= -1)) ||
          (cooldownId === SPELLS.ASCENDANCE_CAST.id && (ABILITIES_NOT_FEEDING_INTO_ASCENDANCE.indexOf(spellId) <= -1))) {
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

  on_byPlayer_damage(event){
    // const index = this.activeCooldowns.findIndex(cooldown => cooldown.ability.id === SPELLS.ANCESTRAL_GUIDANCE_CAST.id);
    // const spellId = event.ability.guid;

    // if (index === -1) {
    //     return;
    // }

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

export default CooldownTracker;
