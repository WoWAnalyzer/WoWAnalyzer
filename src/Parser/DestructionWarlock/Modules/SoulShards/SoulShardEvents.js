import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Enemies from 'Parser/Core/Modules/Enemies';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const debug = false;

const MAX_FRAGMENTS = 50;
const FRAGMENTS_PER_SHARD = 10;
const SHADOWBURN_DEBUFF_DURATION = 5000;

class SoulShardEvents extends Module {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  _FRAGMENT_GENERATING_ABILITIES = {
    [SPELLS.IMMOLATE_DEBUFF.id]: (_) => 1,
    [SPELLS.CONFLAGRATE.id]: (_) => 5,
    //the Shadowburn itself generates 5 fragments, but leaves a debuff on target for 5 seconds, and if it dies, it generates additional 5 fragments
    //don't know how to accurately separate these two (could do totalFragments - numberOfShadowburnCasts * 5, but this doesn't account for possible wasted fragments = inaccurate)
    //solution would be to fabricate a dummy spell with id unused by any other ability and manipulate the event passed into processGenerators but that feels so wrong
    [SPELLS.SHADOWBURN.id]: (_) => 5,
    [SPELLS.INCINERATE.id]: (event) => {
      const enemy = this.enemies.getEntity(event);
      if (!enemy) {
        //shouldn't happen, bail out
        return;
      }

      const hasHavoc = enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp);
      //Havoc is somehow bugged in the sense that it doesn't gain the benefit of T20 2p set bonus, so if the target has Havoc, it doesn't matter if we have the set or not, otherwise it counts it in
      let rawFragments = hasHavoc ? 2 : (this._hasT20_2p ? 3 : 2);
      if (event.hitType === HIT_TYPES.CRIT) {
        rawFragments++;
      }
      return rawFragments;
    },
    [SPELLS.DIMENSIONAL_RIFT_CAST.id]: (_) => 3,
    //can refund more shards
    [SPELLS.SOUL_CONDUIT_SHARD_GEN.id]: (event) => (event.resourceChange || 0) * FRAGMENTS_PER_SHARD,
    //these can refund only one shard at a time
    [SPELLS.SOULSNATCHER_FRAGMENT_GEN.id]: (_) => 10,
    [SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id]: (_) => 10,
  };

  _FRAGMENT_SPENDING_ABILITIES  = {
    [SPELLS.CHAOS_BOLT.id]: 20,
    [SPELLS.RAIN_OF_FIRE_CAST.id]: 30,
    [SPELLS.SUMMON_INFERNAL_UNTALENTED.id]: 10,
    [SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id]: 10,
    [SPELLS.GRIMOIRE_IMP.id]: 10,
    [SPELLS.SUMMON_IMP.id]: 10,
    //most likely unused but should be accounted for
    [SPELLS.SUMMON_INFERNAL_TALENTED.id]: 10,
    [SPELLS.SUMMON_DOOMGUARD_TALENTED.id]: 10,
    [SPELLS.GRIMOIRE_VOIDWALKER.id]: 10,
    [SPELLS.GRIMOIRE_SUCCUBUS.id]: 10,
    [SPELLS.GRIMOIRE_FELHUNTER.id]: 10,
    [SPELLS.SUMMON_VOIDWALKER.id]: 10,
    [SPELLS.SUMMON_SUCCUBUS.id]: 10,
    [SPELLS.SUMMON_FELHUNTER.id]: 10,
  };


  _hasT20_2p = false;
  _currentFragments = 0;
  _expectedShadowburnDebuffEnds = []; //we can have up to 2 Shadowburn debuffs active on mobs (it has 2 charges)

  on_initialized() {
    if (!this.owner.error) {
      this._hasT20_2p = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
      this._currentFragments = 30; //on the start of the fight we should have 3 soul shards (30 fragments) by default
    }
  }

  on_byPlayer_energize(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.SOUL_SHARDS) {
      return;
    }
    if (this._FRAGMENT_GENERATING_ABILITIES[event.ability.guid]) {
      this.processGenerators(event);
    }
  }

  on_byPlayer_damage(event) {
    if (this._FRAGMENT_GENERATING_ABILITIES[event.ability.guid]) {
      this.processGenerators(event);
    }
  }

  // Shadowburn handling

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid === SPELLS.SHADOWBURN.id) {
      this._expectedShadowburnDebuffEnds.push({
        targetID: event.targetID,
        targetInstance: event.targetInstance,
        expectedEnd: event.timestamp + SHADOWBURN_DEBUFF_DURATION,
      });

      debug && console.log("Shadowburn applydebuff, debuffEnds:", JSON.stringify(this._expectedShadowburnDebuffEnds));
    }
  }

  on_byPlayer_refreshdebuff(event) {
    if (event.ability.guid === SPELLS.SHADOWBURN.id) {
      this._expectedShadowburnDebuffEnds.forEach(debuff => {
        if (debuff.targetID === event.targetID && debuff.targetInstance === event.targetInstance) {
          debug && console.log("found SB, refreshing");
          debuff.expectedEnd = event.timestamp + SHADOWBURN_DEBUFF_DURATION;
        }
      });

      debug && console.log("Shadowburn refreshdebuff, debuffEnds:", JSON.stringify(this._expectedShadowburnDebuffEnds));
    }
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid === SPELLS.SHADOWBURN.id) {
      //find the expected end timestamp for the given debuff
      const debuffTargetIndex = this._expectedShadowburnDebuffEnds.findIndex(debuff => debuff.targetID === event.targetID && debuff.targetInstance === event.targetInstance);
      if (debuffTargetIndex === -1) { //should always exist, if not then panic and bail out
        return;
      }

      if (event.timestamp < this._expectedShadowburnDebuffEnds[debuffTargetIndex].expectedEnd) {
        //Shadowburn debuff expired sooner than it should = target died = generate another 5 fragments
        debug && console.log("Shadowburn kill");
        this.processGenerators(event);
      }
      this._expectedShadowburnDebuffEnds.splice(debuffTargetIndex, 1); //remove the debuff from array
      debug && console.log("Shadowburn removedebuff (end), debuffEnds:", JSON.stringify(this._expectedShadowburnDebuffEnds));
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIMENSIONAL_RIFT_CAST.id) {
      this.processGenerators(event);
    }
    else if (this._FRAGMENT_SPENDING_ABILITIES[spellId]) {
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
    };
    const gainedFragmentsBeforeCap = this._FRAGMENT_GENERATING_ABILITIES[spellId](event);
    let gain = 0;
    let waste = 0;
    if (this._currentFragments + gainedFragmentsBeforeCap > MAX_FRAGMENTS) {
      gain = MAX_FRAGMENTS - this._currentFragments;
      waste = this._currentFragments + gainedFragmentsBeforeCap - MAX_FRAGMENTS;
    }
    else {
      gain = gainedFragmentsBeforeCap;
    }

    this._currentFragments += gain;

    shardEvent.amount = gain;
    shardEvent.waste = waste;
    shardEvent.currentFragments = this._currentFragments;

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
    };

    const amount = this._FRAGMENT_SPENDING_ABILITIES[spellId];

    if (this._currentFragments - amount < 0) {
      //create a "compensation" event for the random Immolate crits
      const balanceEvent = {
        timestamp: event.timestamp,
        type: 'soulshardfragment_gained',
        ability: {
          guid: SPELLS.IMMOLATE_DEBUFF.id,
          name: SPELLS.IMMOLATE_DEBUFF.name,
        },
        amount: Math.abs(this._currentFragments - amount),
        waste: 0,
      };
      this._currentFragments += balanceEvent.amount;
      balanceEvent.currentFragments = this._currentFragments;

      debug && console.log('++ ' + balanceEvent.amount + '(w: ' + balanceEvent.waste + ') = ' + balanceEvent.currentFragments + ', ' + balanceEvent.ability.name);
      this.owner.triggerEvent('soulshardfragment_gained', balanceEvent);
    }
    this._currentFragments -= amount;

    shardEvent.amount = amount;
    shardEvent.currentFragments = this._currentFragments;

    debug && console.log('-- ' + shardEvent.amount + ' = ' + shardEvent.currentFragments + ', ' + shardEvent.ability.name + ', orig:', event);
    this.owner.triggerEvent('soulshardfragment_spent', shardEvent);
  }
}

export default SoulShardEvents;
