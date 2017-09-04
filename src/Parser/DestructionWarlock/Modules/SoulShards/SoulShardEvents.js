import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const debug = false;

const SUMMON_COST = 10;
const CHAOS_BOLT_COST = 20;
const RAIN_OF_FIRE_COST = 30;
const MAX_FRAGMENTS = 50;
const FRAGMENTS_PER_SHARD = 10;

const FRAGMENT_GENERATING_ABILITIES = [
  SPELLS.IMMOLATE_DEBUFF.id,
  SPELLS.CONFLAGRATE.id,
  SPELLS.INCINERATE.id,
  //Dimensional Rift would also be here, but that is evaluated on cast, not damage and would proc a lot of times
];

const FRAGMENT_SPENDING_ABILITIES  = {
  [SPELLS.CHAOS_BOLT.id]: CHAOS_BOLT_COST,
  [SPELLS.RAIN_OF_FIRE_CAST.id]: RAIN_OF_FIRE_COST,
  [SPELLS.SUMMON_INFERNAL_UNTALENTED.id]: SUMMON_COST,
  [SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id]: SUMMON_COST,
  [SPELLS.GRIMOIRE_IMP.id]: SUMMON_COST,
  [SPELLS.SUMMON_IMP.id]: SUMMON_COST,
  //most likely unused but should be accounted for
  [SPELLS.SUMMON_INFERNAL_TALENTED.id]: SUMMON_COST,
  [SPELLS.SUMMON_DOOMGUARD_TALENTED.id]: SUMMON_COST,
  [SPELLS.GRIMOIRE_VOIDWALKER.id]: SUMMON_COST,
  [SPELLS.GRIMOIRE_SUCCUBUS.id]: SUMMON_COST,
  [SPELLS.GRIMOIRE_FELHUNTER.id]: SUMMON_COST,
  [SPELLS.SUMMON_VOIDWALKER.id]: SUMMON_COST,
  [SPELLS.SUMMON_SUCCUBUS.id]: SUMMON_COST,
  [SPELLS.SUMMON_FELHUNTER.id]: SUMMON_COST,
};

const FRAGMENT_GENERATING_ENERGIZE_ABILITIES = [
  SPELLS.SOUL_CONDUIT_SHARD_GEN.id,
  SPELLS.SOULSNATCHER_FRAGMENT_GEN.id,
  SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id,
];

class SoulShardEvents extends Module {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  hasT20_2p = false;
  currentFragments = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.hasT20_2p = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
      this.currentFragments = 30; //on the start of the fight we should have 3 soul shards (30 fragments) by default
      debug && console.log("start fragments " + this.currentFragments);
    }
  }

  on_byPlayer_energize(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.SOUL_SHARDS) {
      return;
    }
    const spellId = event.ability.guid;
    if (FRAGMENT_GENERATING_ENERGIZE_ABILITIES.indexOf(spellId) === -1) {
      return;
    }

    const shardEvent = {
      timestamp: event.timestamp,
      type: 'soulshardfragment_gained',
      ability: {
        guid: spellId,
        name: SPELLS[spellId].name,
      },
    };
    //purposefully missing targetID and targetInstance because both source and target on energize is the player

    const rawGain = event.resourceChange * FRAGMENTS_PER_SHARD;
    let gain = 0;
    let waste = 0;
    if (this.currentFragments + rawGain > MAX_FRAGMENTS) {
      gain = MAX_FRAGMENTS - this.currentFragments;
      waste = this.currentFragments + rawGain - MAX_FRAGMENTS;
    }
    else {
      gain = rawGain;
    }

    this.currentFragments += gain;

    shardEvent.amount = gain;
    shardEvent.waste = waste;
    shardEvent.currentFragments = this.currentFragments;

    debug && console.log('++ ' + shardEvent.amount + '(w: ' + shardEvent.waste + ') = ' + shardEvent.currentFragments + ', ' + shardEvent.ability.name + ', orig: ', event);
    this.owner.triggerEvent('soulshardfragment_gained', shardEvent);
  }

  //should also work with Havoc and talent Fire and Brimstone
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (FRAGMENT_GENERATING_ABILITIES.indexOf(spellId) === -1) {
      return;
    }

    const shardEvent = {
      timestamp: event.timestamp,
      type: 'soulshardfragment_gained',
      ability: {
        guid: spellId,
        name: SPELLS[spellId].name,
      },
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    };
    let rawGain;
    let gain = 0;
    let waste = 0;

    switch (spellId) {
      case SPELLS.IMMOLATE_DEBUFF.id:
        rawGain = 1;
        break;
      case SPELLS.CONFLAGRATE.id:
        rawGain = 5;
        break;
      case SPELLS.INCINERATE.id:
        const enemy = this.enemies.getEntity(event);
        if (!enemy) {
          //shouldn't happen, bail out
          return;
        }

        const hasHavoc = enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp);
        //Havoc is somehow bugged in the sense that it doesn't gain the benefit of T20 2p set bonus, so if the target has Havoc, it doesn't matter if we have the set or not, otherwise it counts it in
        rawGain = hasHavoc ? 2 : (this.hasT20_2p ? 3 : 2);
        if (event.hitType === HIT_TYPES.CRIT) {
          rawGain++;
        }
        break;
      default:
        break;
    }
    if (this.currentFragments + rawGain > MAX_FRAGMENTS) {
      gain = MAX_FRAGMENTS - this.currentFragments;
      waste = this.currentFragments + rawGain - MAX_FRAGMENTS;
    }
    else {
      gain = rawGain;
    }

    this.currentFragments += gain;

    shardEvent.amount = gain;
    shardEvent.waste = waste;
    shardEvent.currentFragments = this.currentFragments; //AFTER adding the amount

    debug && console.log('++ ' + shardEvent.amount + '(w: ' + shardEvent.waste + ') = ' + shardEvent.currentFragments + ', ' + shardEvent.ability.name + ', orig: ', event);
    this.owner.triggerEvent('soulshardfragment_gained', shardEvent);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIMENSIONAL_RIFT_CAST.id) {
      this.processDimensionalRift(event);
    }
    else if (FRAGMENT_SPENDING_ABILITIES[spellId]) {
      this.processSpenders(event);
    }
  }

  //in order to de-clutter on_byPlayer_cast()
  processDimensionalRift(event) {
    const spellId = event.ability.guid;
    const shardEvent = {
      timestamp: event.timestamp,
      type: 'soulshardfragment_gained',
      ability: {
        guid: spellId,
        name: SPELLS[spellId].name,
      },
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    };
    const rawGain = 3;
    let gain = 0;
    let waste = 0;
    if (this.currentFragments + rawGain > MAX_FRAGMENTS) {
      gain = MAX_FRAGMENTS - this.currentFragments;
      waste = this.currentFragments + rawGain - MAX_FRAGMENTS;
    }
    else {
      gain = rawGain;
    }

    this.currentFragments += gain;

    shardEvent.amount = gain;
    shardEvent.waste = waste;
    shardEvent.currentFragments = this.currentFragments;

    debug && console.log('++ ' + shardEvent.amount + '(w: ' + shardEvent.waste + ') = ' + shardEvent.currentFragments + ', ' + shardEvent.ability.name + ', orig: ', event);
    this.owner.triggerEvent('soulshardfragment_gained', shardEvent);
  }

  processSpenders(event) {
    const spellId = event.ability.guid;
    const shardEvent = {
      timestamp: event.timestamp,
      type: 'soulshardfragment_spent',
      ability: {
        guid: spellId,
        name: SPELLS[spellId].name,
      },
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    };

    const amount = FRAGMENT_SPENDING_ABILITIES[spellId];

    if (this.currentFragments - amount < 0) {
      //create a "compensation" event for the random Immolate crits
      const balanceEvent = {
        timestamp: event.timestamp,
        type: 'soulshardfragment_gained',
        ability: {
          guid: SPELLS.IMMOLATE_DEBUFF.id,
          name: SPELLS.IMMOLATE_DEBUFF.name,
        },
        amount: Math.abs(this.currentFragments - amount),
        waste: 0,
      };
      this.currentFragments += balanceEvent.amount;
      balanceEvent.currentFragments = this.currentFragments;

      debug && console.log('++ ' + balanceEvent.amount + '(w: ' + balanceEvent.waste + ') = ' + balanceEvent.currentFragments + ', ' + balanceEvent.ability.name);
      this.owner.triggerEvent('soulshardfragment_gained', balanceEvent);
    }
    this.currentFragments -= amount;

    shardEvent.amount = amount;
    shardEvent.currentFragments = this.currentFragments;

    debug && console.log('-- ' + shardEvent.amount + ' = ' + shardEvent.currentFragments + ', ' + shardEvent.ability.name + ', orig:', event);
    this.owner.triggerEvent('soulshardfragment_spent', shardEvent);
  }
}

export default SoulShardEvents;
