import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';
import SoulShardEvents from './SoulShardEvents';

const FRAGMENT_GENERATING_ABILITIES = [
  SPELLS.IMMOLATE_DEBUFF.id,
  SPELLS.CONFLAGRATE.id,
  SPELLS.INCINERATE.id,
  SPELLS.DIMENSIONAL_RIFT_CAST.id,
  SPELLS.SOULSNATCHER_FRAGMENT_GEN.id,
];

const FRAGMENT_SPENDING_ABILITIES = [
  SPELLS.CHAOS_BOLT.id,
  SPELLS.RAIN_OF_FIRE_CAST.id,
  SPELLS.SUMMON_IMP.id,
  SPELLS.SUMMON_VOIDWALKER.id,
  SPELLS.SUMMON_SUCCUBUS.id,
  SPELLS.SUMMON_FELHUNTER.id,
];

class SoulShardTracker extends Module {
  static dependencies = {
    soulShardEvents: SoulShardEvents,
    combatants: Combatants,
  };
  fragmentsGained = 0;
  fragmentsWasted = 0;
  fragmentsSpent = 0;

  //stores number of shards gained/spent/wasted per ability ID
  gained = {};
  spent = {};
  wasted = {};

  on_initialized() {
    //initialize base abilities, rest depends on talents and equip
    FRAGMENT_GENERATING_ABILITIES.forEach(x => {
      this.gained[x] = { fragments: 0 };
      this.wasted[x] = { fragments: 0 };
    });
    FRAGMENT_SPENDING_ABILITIES.forEach(x => this.spent[x] = { fragments: 0 });

    const player = this.combatants.selected;

    if (player.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id)) {
      this.gained[SPELLS.SOUL_CONDUIT_SHARD_GEN.id] = { fragments: 0 };
      this.wasted[SPELLS.SOUL_CONDUIT_SHARD_GEN.id] = { fragments: 0 };
      FRAGMENT_GENERATING_ABILITIES.push(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    }
    if (player.hasWaist(ITEMS.FERETORY_OF_SOULS.id)) {
      this.gained[SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id] = { fragments: 0 };
      this.wasted[SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id] = { fragments: 0 };
      FRAGMENT_GENERATING_ABILITIES.push(SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id);
    }

    if (player.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id)) {
      this.spent[SPELLS.SUMMON_DOOMGUARD_TALENTED.id] = { fragments: 0 };
      this.spent[SPELLS.SUMMON_INFERNAL_TALENTED.id] = { fragments: 0 };
      FRAGMENT_SPENDING_ABILITIES.push(SPELLS.SUMMON_INFERNAL_TALENTED.id, SPELLS.SUMMON_DOOMGUARD_TALENTED.id);
    }
    else {
      //Grimoire of Service or Sacrifice, both have the untalented version of Doomguard / Infernal
      this.spent[SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id] = { fragments: 0 };
      this.spent[SPELLS.SUMMON_INFERNAL_UNTALENTED.id] = { fragments: 0 };
      FRAGMENT_SPENDING_ABILITIES.push(SPELLS.SUMMON_INFERNAL_UNTALENTED.id, SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id);

      //Service has 4 new summons then
      if (player.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id)) {
        this.spent[SPELLS.GRIMOIRE_IMP.id] = { fragments: 0 };
        this.spent[SPELLS.GRIMOIRE_VOIDWALKER.id] = { fragments: 0 };
        this.spent[SPELLS.GRIMOIRE_FELHUNTER.id] = { fragments: 0 };
        this.spent[SPELLS.GRIMOIRE_SUCCUBUS.id] = { fragments: 0 };
        FRAGMENT_SPENDING_ABILITIES.push(SPELLS.GRIMOIRE_IMP.id,
          SPELLS.GRIMOIRE_VOIDWALKER.id,
          SPELLS.GRIMOIRE_FELHUNTER.id,
          SPELLS.GRIMOIRE_SUCCUBUS.id);
      }
    }
  }

  on_soulshardfragment_gained(event) {
    const spellId = event.ability.guid;
    if (FRAGMENT_GENERATING_ABILITIES.indexOf(spellId) === -1) {
      //shouldn't happen
      return;
    }

    if (event.waste !== 0) {
      this.wasted[spellId].fragments += event.waste;
      this.fragmentsWasted += event.waste;
    }
    else {
      this.gained[spellId].fragments += event.amount;
      this.fragmentsGained += event.amount;
    }
  }

  on_soulshardfragment_spent(event) {
    const spellId = event.ability.guid;
    if (FRAGMENT_SPENDING_ABILITIES.indexOf(spellId) === -1) {
      //shouldn't happen
      return;
    }
    this.spent[spellId].fragments += event.amount;
    this.fragmentsSpent += event.amount;
  }
}

export default SoulShardTracker;
