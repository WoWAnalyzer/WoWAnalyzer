import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
//import ITEMS from 'common/ITEMS';

const pointGeneratingAbilities = [
  SPELLS.SHRED.id,
  SPELLS.RAKE.id,
  SPELLS.PRIMAL_FURY.id,
  SPELLS.ASHAMANES_FRENZY.id,
];

const pointSpendingAbilities = [
  SPELLS.SAVAGE_ROAR_TALENT.id,
  SPELLS.RIP.id,
  SPELLS.FEROCIOUS_BITE.id,
];

class ComboPointTracker extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  pointsGained = 0;
  pointsWasted = 0;
  pointsSpent = 0;

  //stores number of points gained/spent/wasted per ability ID
  gained = {};
  spent = {};
  wasted = {};

  on_initialized() {
    //initialize base abilities, rest depends on talents and equip
    pointGeneratingAbilities.forEach(x => {
      this.gained[x] = { points: 0 };
      this.wasted[x] = { points: 0 };
    });
    pointSpendingAbilities.forEach(x => this.spent[x] = { points: 0 });

    //const player = this.combatants.selected;
    // if (player.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id)) {
    //   this.gained[SPELLS.SOUL_CONDUIT_SHARD_GEN.id] = { points: 0 };
    //   this.wasted[SPELLS.SOUL_CONDUIT_SHARD_GEN.id] = { points: 0 };
    //   pointGeneratingAbilities.push(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    // }
    // if (player.hasBuff(SPELLS.WARLOCK_AFFLI_T20_2P_BONUS.id)) {
    //   this.gained[SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id] = { points: 0 };
    //   this.wasted[SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id] = { points: 0 };
    //   pointGeneratingAbilities.push(SPELLS.WARLOCK_AFFLI_T20_2P_SHARD_GEN.id);
    // }
    // if (player.hasWaist(ITEMS.POWER_CORD_OF_LETHTENDRIS.id)) {
    //   this.gained[SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id] = { points: 0 };
    //   this.wasted[SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id] = { points: 0 };
    //   pointGeneratingAbilities.push(SPELLS.POWER_CORD_OF_LETHTENDRIS_SHARD_GEN.id);
    // }
    //
    // if (player.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id)) {
    //   this.spent[SPELLS.SUMMON_DOOMGUARD_TALENTED.id] = { points: 0 };
    //   this.spent[SPELLS.SUMMON_INFERNAL_TALENTED.id] = { points: 0 };
    //   pointSpendingAbilities.push(SPELLS.SUMMON_INFERNAL_TALENTED.id, SPELLS.SUMMON_DOOMGUARD_TALENTED.id);
    // }
    // else if (player.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id)) {
    //   this.spent[SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id] = { points: 0 };
    //   this.spent[SPELLS.SUMMON_INFERNAL_UNTALENTED.id] = { points: 0 };
    //   this.spent[SPELLS.GRIMOIRE_IMP.id] = { points: 0 };
    //   this.spent[SPELLS.GRIMOIRE_VOIDWALKER.id] = { points: 0 };
    //   this.spent[SPELLS.GRIMOIRE_FELHUNTER.id] = { points: 0 };
    //   this.spent[SPELLS.GRIMOIRE_SUCCUBUS.id] = { points: 0 };
    //   pointSpendingAbilities.push(SPELLS.SUMMON_INFERNAL_UNTALENTED.id,
    //     SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id,
    //     SPELLS.GRIMOIRE_IMP.id,
    //     SPELLS.GRIMOIRE_VOIDWALKER.id,
    //     SPELLS.GRIMOIRE_FELHUNTER.id,
    //     SPELLS.GRIMOIRE_SUCCUBUS.id);
    // }
    // else {
    //   this.spent[SPELLS.SUMMON_IMP.id] = { points: 0 };
    //   this.spent[SPELLS.SUMMON_VOIDWALKER.id] = { points: 0 };
    //   this.spent[SPELLS.SUMMON_SUCCUBUS.id] = { points: 0 };
    //   this.spent[SPELLS.SUMMON_FELHUNTER.id] = { points: 0 };
    //   pointSpendingAbilities.push(SPELLS.SUMMON_IMP.id,
    //     SPELLS.SUMMON_VOIDWALKER.id,
    //     SPELLS.SUMMON_SUCCUBUS.id,
    //     SPELLS.SUMMON_FELHUNTER.id);
    // }
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (pointGeneratingAbilities.indexOf(spellId) === -1) {
      return;
    }

    if (event.waste !== 0) {
      this.wasted[spellId].points++;
      this.pointsWasted++;
    }
    else {
      this.gained[spellId].points++;
      this.pointsGained++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (pointSpendingAbilities.indexOf(spellId) === -1) {
      return;
    }
    // each finisher uses all available points, varying from 1 to 5
    const pointsInCast = event.classResources[1].amount;
    this.spent[spellId].points += pointsInCast;
    this.pointsSpent += pointsInCast;
  }
}

export default ComboPointTracker;
