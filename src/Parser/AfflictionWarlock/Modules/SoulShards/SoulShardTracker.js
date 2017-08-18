import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

const shardGeneratingAbilities = [
  SPELLS.AGONY_SHARD_GEN.id,
  SPELLS.UNSTABLE_AFFLICTION_KILL_SHARD_GEN.id,
  SPELLS.DRAIN_SOUL_KILL_SHARD_GEN.id,
];

const shardSpendingAbilities = [
  SPELLS.UNSTABLE_AFFLICTION_CAST.id,
  SPELLS.SEED_OF_CORRUPTION_DEBUFF.id,
];

class SoulShardTracker extends Module {
  shardsGained = 0;
  shardsWasted = 0;
  shardsSpent = 0;

  gained = {};
  spent = {};
  wasted = {};

  on_initialized() {
    //initialize base abilities, rest depends on talents and equip
    shardGeneratingAbilities.forEach(x => {
      this.gained[x] = { shards: 0 };
      this.wasted[x] = { shards: 0 };
    });
    shardSpendingAbilities.forEach(x => this.spent[x] = { shards: 0 });

    const player = this.owner.selectedCombatant;
    if (player.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id)) {
      this.gained[SPELLS.SOUL_CONDUIT_SHARD_GEN.id] = { shards: 0 };
      this.wasted[SPELLS.SOUL_CONDUIT_SHARD_GEN.id] = { shards: 0 };
      shardGeneratingAbilities.push(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    }
    if (player.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id)) {
      this.gained[SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id] = { shards: 0 };
      this.wasted[SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id] = { shards: 0 };
      shardGeneratingAbilities.push(SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id);
    }
    if (player.hasWaist(ITEMS.POWER_CORD_OF_LETHTENDRIS.id)) {
      this.gained[SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id] = { shards: 0 };
      this.wasted[SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id] = { shards: 0 };
      shardGeneratingAbilities.push(SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id);
    }

    if (player.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id)) {
      this.spent[SPELLS.SUMMON_DOOMGUARD_TALENTED.id] = { shards: 0 };
      this.spent[SPELLS.SUMMON_INFERNAL_TALENTED.id] = { shards: 0 };
      shardSpendingAbilities.push(SPELLS.SUMMON_INFERNAL_TALENTED.id, SPELLS.SUMMON_DOOMGUARD_TALENTED.id);
    }
    else if (player.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id)) {
      this.spent[SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id] = { shards: 0 };
      this.spent[SPELLS.SUMMON_INFERNAL_UNTALENTED.id] = { shards: 0 };
      this.spent[SPELLS.GRIMOIRE_IMP.id] = { shards: 0 };
      this.spent[SPELLS.GRIMOIRE_VOIDWALKER.id] = { shards: 0 };
      this.spent[SPELLS.GRIMOIRE_FELHUNTER.id] = { shards: 0 };
      this.spent[SPELLS.GRIMOIRE_SUCCUBUS.id] = { shards: 0 };
      shardSpendingAbilities.push(SPELLS.SUMMON_INFERNAL_UNTALENTED.id,
        SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id,
        SPELLS.GRIMOIRE_IMP.id,
        SPELLS.GRIMOIRE_VOIDWALKER.id,
        SPELLS.GRIMOIRE_FELHUNTER.id,
        SPELLS.GRIMOIRE_SUCCUBUS.id);
    }
    else {
      this.spent[SPELLS.SUMMON_IMP.id] = { shards: 0 };
      this.spent[SPELLS.SUMMON_VOIDWALKER.id] = { shards: 0 };
      this.spent[SPELLS.SUMMON_SUCCUBUS.id] = { shards: 0 };
      this.spent[SPELLS.SUMMON_FELHUNTER.id] = { shards: 0 };
      shardSpendingAbilities.push(SPELLS.SUMMON_IMP.id,
        SPELLS.SUMMON_VOIDWALKER.id,
        SPELLS.SUMMON_SUCCUBUS.id,
        SPELLS.SUMMON_FELHUNTER.id);
    }
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (shardGeneratingAbilities.indexOf(spellId) === -1)
      return;

    if (event.waste !== 0) {
      this.wasted[spellId].shards++;
      this.shardsWasted++;
    }
    else {
      this.gained[spellId].shards++;
      this.shardsGained++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (shardSpendingAbilities.indexOf(spellId) === -1)
      return;
    this.spent[spellId].shards++;
    this.shardsSpent++;
  }
}

export default SoulShardTracker;
