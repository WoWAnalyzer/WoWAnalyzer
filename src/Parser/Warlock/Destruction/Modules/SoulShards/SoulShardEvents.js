import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const debug = false;

const MAX_FRAGMENTS = 50;
const FRAGMENTS_PER_SHARD = 10;

// TODO: Revisit this - check fragment numbers in generators, account for perhaps Inferno (rain of fire can generate a fragment), also Fire and Brimstone cleave
class SoulShardEvents extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  _FRAGMENT_GENERATING_ABILITIES = {
    [SPELLS.IMMOLATE_DEBUFF.id]: _ => 1, // has 50% chance of additional fragment on crit
    [SPELLS.CONFLAGRATE.id]: _ => 5,
    [SPELLS.SHADOWBURN_TALENT.id]: _ => 3,
    [SPELLS.INCINERATE.id]: (event) => {
      const enemy = this.enemies.getEntity(event);
      if (!enemy) {
        // shouldn't happen, bail out
        return null;
      }

      const hasHavoc = enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp);
      // Havoc is somehow bugged in the sense that it doesn't gain the benefit of T20 2p set bonus, so if the target has Havoc, it doesn't matter if we have the set or not, otherwise it counts it in
      let rawFragments = hasHavoc ? 2 : (this._hasT20_2p ? 3 : 2);
      if (event.hitType === HIT_TYPES.CRIT) {
        rawFragments += 1;
      }
      return rawFragments;
    },
    // can refund more shards
    [SPELLS.SOUL_CONDUIT_SHARD_GEN.id]: event => (event.resourceChange || 0) * FRAGMENTS_PER_SHARD,
    // these can refund only one shard at a time
    [SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id]: _ => 10,
  };

  _FRAGMENT_SPENDING_ABILITIES = {
    [SPELLS.CHAOS_BOLT.id]: 20,
    [SPELLS.RAIN_OF_FIRE_CAST.id]: 30,
    [SPELLS.SUMMON_INFERNAL.id]: 10,
    [SPELLS.SUMMON_IMP.id]: 10,
    [SPELLS.SOUL_FIRE_TALENT.id]: 10,
    // most likely unused but should be accounted for
    [SPELLS.SUMMON_VOIDWALKER.id]: 10,
    [SPELLS.SUMMON_SUCCUBUS.id]: 10,
    [SPELLS.SUMMON_FELHUNTER.id]: 10,
  };

  _hasT20_2p = false;
  _currentFragments = 0;

  constructor(...args) {
    super(...args);
    this._hasT20_2p = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
    this._currentFragments = 30; // on the start of the fight we should have 3 soul shards (30 fragments) by default
  }

  on_byPlayer_energize(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.SOUL_SHARDS.id) {
      return;
    }
    if (this._FRAGMENT_GENERATING_ABILITIES[event.ability.guid]) {
      // purposefully delete the event's target ID and instance (it's player anyway)
      delete event.targetID;
      delete event.targetInstance;
      this.processGenerators(event);
    }
  }

  // handles regular Shadowburn fragment gen
  on_byPlayer_damage(event) {
    if (this._FRAGMENT_GENERATING_ABILITIES[event.ability.guid]) {
      this.processGenerators(event);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this._FRAGMENT_SPENDING_ABILITIES[spellId]) {
      this.processSpenders(event);
    }
  }

  processGenerators(event) {
    const spellId = event.ability.guid;
    const shardEvent = {
      timestamp: event.timestamp,
      type: 'soulshardfragment_gained',
      ability: {
        guid: spellId,
        name: SPELLS[spellId].name,
      },
      damage: (event.amount || 0) + (event.absorbed || 0),
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    };
    const gainedFragmentsBeforeCap = this._FRAGMENT_GENERATING_ABILITIES[spellId](event);
    let gain = 0;
    let waste = 0;
    if (this._currentFragments + gainedFragmentsBeforeCap > MAX_FRAGMENTS) {
      gain = MAX_FRAGMENTS - this._currentFragments;
      waste = this._currentFragments + gainedFragmentsBeforeCap - MAX_FRAGMENTS;
    } else {
      gain = gainedFragmentsBeforeCap;
    }

    this._currentFragments += gain;

    shardEvent.amount = gain;
    shardEvent.waste = waste;
    if (event.isFromShadowburnKill) {
      shardEvent.isFromShadowburnKill = true;
    }
    shardEvent.currentFragments = this._currentFragments;

    debug && console.log(`++ ${shardEvent.amount}(w: ${shardEvent.waste}) = ${shardEvent.currentFragments}, ${shardEvent.ability.name}, orig: `, event);
    this.owner.fabricateEvent(shardEvent, event);
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
    };

    const amount = this._FRAGMENT_SPENDING_ABILITIES[spellId];

    if (this._currentFragments - amount < 0) {
      // create a "compensation" event for the random Immolate crits
      const balanceEvent = {
        timestamp: event.timestamp,
        type: 'soulshardfragment_gained',
        ability: {
          guid: SPELLS.IMMOLATE_DEBUFF.id,
          name: SPELLS.IMMOLATE_DEBUFF.name,
        },
        targetID: event.targetID,
        targetInstance: event.targetInstance,
        amount: Math.abs(this._currentFragments - amount),
        waste: 0,
      };
      this._currentFragments += balanceEvent.amount;
      balanceEvent.currentFragments = this._currentFragments;

      debug && console.log(`++ ${balanceEvent.amount}(w: ${balanceEvent.waste}) = ${balanceEvent.currentFragments}, ${balanceEvent.ability.name}`);
      this.owner.fabricateEvent(balanceEvent, event);
    }
    this._currentFragments -= amount;

    shardEvent.amount = amount;
    shardEvent.currentFragments = this._currentFragments;

    debug && console.log(`-- ${shardEvent.amount} = ${shardEvent.currentFragments}, ${shardEvent.ability.name}, orig:`, event);
    this.owner.fabricateEvent(shardEvent, event);
  }
}

export default SoulShardEvents;
