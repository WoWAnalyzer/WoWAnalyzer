import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const MAX_SHARDS = 5;

class SoulShardTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _current = 3; // assume 3 shards at combat start (gets set correctly at Unstable Affliction cast event)
  _fullShardTimestamp = null;


  shardsWasted = 0;
  shardsSpent = 0;
  timeOnFullShards = 0;

  // stores number of shards generated/spent/wasted per ability ID
  generatedAndWasted = {
    [SPELLS.AGONY_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOUL_CONDUIT_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
  };

  spent = {
    [SPELLS.UNSTABLE_AFFLICTION_CAST.id]: 0,
    [SPELLS.SEED_OF_CORRUPTION_DEBUFF.id]: 0,
    [SPELLS.VILE_TAINT_TALENT.id]: 0,
    [SPELLS.SUMMON_DARKGLARE.id]: 0,
    [SPELLS.SUMMON_IMP.id]: 0,
    [SPELLS.SUMMON_VOIDWALKER.id]: 0,
    [SPELLS.SUMMON_SUCCUBUS.id]: 0,
    [SPELLS.SUMMON_FELHUNTER.id]: 0,
    [SPELLS.GRIMOIRE_IMP.id]: 0,
    [SPELLS.GRIMOIRE_VOIDWALKER.id]: 0,
    [SPELLS.GRIMOIRE_FELHUNTER.id]: 0,
    [SPELLS.GRIMOIRE_SUCCUBUS.id]: 0,
  };

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (!this.generatedAndWasted[spellId]) {
      return;
    }

    // Affli abilities and effects generate/refund 1 shard at a time, so it's either generated or wasted, not both
    if (event.waste !== 0) {
      this.generatedAndWasted[spellId].wasted += 1;
      this.shardsWasted += 1;
    } else {
      this.generatedAndWasted[spellId].generated += 1;
      this._current += 1;
      if (this._current === MAX_SHARDS) {
        this._fullShardTimestamp = event.timestamp;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.spent[spellId] === undefined) {
      return;
    }
    this.spent[spellId] += 1;
    this.shardsSpent += 1;
    if (this._current === MAX_SHARDS) {
      this.timeOnFullShards += event.timestamp - this._fullShardTimestamp;
    }
    if (!event.classResources || !event.classResources[0] || !event.classResources[0].type !== RESOURCE_TYPES.SOUL_SHARDS.id) {
      // if something goes wrong, subtract 1 shard as usual, but getting the info from classResources should accurate
      this._current -= 1;
    }
    else {
      // amount contains the amount of shards *before* the cast, so to get the amount after the cast, we subtract the cost
      let amount = event.classResources[0].amount - event.classResources[0].cost;
      if (amount >= 10) {
        // old logs (I think Nighthold era) used to have soul shards expressed as 0 - 5 whereas the new logs have 0 - 50 (multiples of 10 to be precise)
        amount /= 10;
      }
      this._current = amount;
    }
  }

  get timeOnFullShardsSeconds() {
    return Math.floor(this.timeOnFullShards / 1000);
  }
}

export default SoulShardTracker;
