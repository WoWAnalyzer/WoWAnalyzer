import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

//TODO: refactor all trackers to use Core ResourceTracker
class SoulShardTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  shardsWasted = 0;
  shardsSpent = 0;

  _firstDoomEnergize = false;
  // stores number of shards generated/spent/wasted per ability ID
  generatedAndWasted = {
    [SPELLS.SHADOW_BOLT_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DEMONBOLT_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DOOM_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOUL_CONDUIT_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.RECURRENT_RITUAL_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOUL_STRIKE_SHARD_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    // I'll have to add manually to this
    [SPELLS.WARLOCK_DEMO_T19_2P_BONUS.id]: {
      generated: 0,
      wasted: 0,
    },
  };

  spent = {
    [SPELLS.HAND_OF_GULDAN_CAST.id]: 0,
    [SPELLS.CALL_DREADSTALKERS.id]: 0,
    [SPELLS.BILESCOURGE_BOMBERS_TALENT.id]: 0,
    [SPELLS.SUMMON_VILEFIEND_TALENT.id]: 0,
    [SPELLS.GRIMOIRE_FELGUARD_TALENT.id]: 0,
    [SPELLS.NETHER_PORTAL_TALENT.id]: 0,
    [SPELLS.SUMMON_FELGUARD.id]: 0,
    // unused
    [SPELLS.SUMMON_IMP.id]: 0,
    [SPELLS.SUMMON_VOIDWALKER.id]: 0,
    [SPELLS.SUMMON_SUCCUBUS.id]: 0,
    [SPELLS.SUMMON_FELHUNTER.id]: 0,
  };

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (!this.generatedAndWasted[spellId]) {
      return;
    }
    let targetSpellId = spellId;
    if (spellId === SPELLS.DOOM_SHARD_GEN.id && this.combatants.selected.hasBuff(SPELLS.WARLOCK_DEMO_T19_2P_BONUS.id)) {
      // check if it's a proc
      if (!this._firstDoomEnergize) {
        this._firstDoomEnergize = true;
      }
      else {
        targetSpellId = SPELLS.WARLOCK_DEMO_T19_2P_BONUS.id;
      }
    }
    this.generatedAndWasted[targetSpellId].wasted += (event.waste || 0);
    this.generatedAndWasted[targetSpellId].generated += (event.resourceChange || 0);
    this.shardsWasted += (event.waste || 0);
  }
  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.DOOM_DAMAGE.id) {
      this._firstDoomEnergize = false; // reset
    }
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.spent[spellId] === undefined) {
      return;
    }
    let shardsSpent;
    if (spellId === SPELLS.CALL_DREADSTALKERS.id && this.combatants.selected.hasBuff(SPELLS.DEMONIC_CALLING_BUFF.id, event.timestamp)) {
      shardsSpent = 0;
    }
    else {
      shardsSpent = event.classResources[0].cost || 0;
    }
    // logs from 7.2 have "correct" amount of shards and cost (max 5, appropriate cost)
    // logs from 7.3 are "adapted" to the Destro changes, so max = 50 and cost is in multiples of 10
    if (shardsSpent > 5) {
      shardsSpent /= 10;
    }
    this.spent[spellId] += shardsSpent;
    this.shardsSpent += shardsSpent;
  }
}

export default SoulShardTracker;
