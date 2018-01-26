import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

const MAX_SHARDS = 5;

class SoulShardTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _current = 3;   // you regenerate 3 shards out of combat so you should be starting combat always with 3 shards
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
    [SPELLS.SUMMON_IMP.id]: 0,
    [SPELLS.SUMMON_VOIDWALKER.id]: 0,
    [SPELLS.SUMMON_SUCCUBUS.id]: 0,
    [SPELLS.SUMMON_FELHUNTER.id]: 0,
    [SPELLS.SUMMON_DOOMGUARD_TALENTED.id]: 0,
    [SPELLS.SUMMON_INFERNAL_TALENTED.id]: 0,
    [SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id]: 0,
    [SPELLS.SUMMON_INFERNAL_UNTALENTED.id]: 0,
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
    this._current -= 1;
  }

  get timeOnFullShardsSeconds() {
    return Math.floor(this.timeOnFullShards / 1000);
  }
}

export default SoulShardTracker;
