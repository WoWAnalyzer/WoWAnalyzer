import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import SoulShardEvents from './SoulShardEvents';

class SoulShardTracker extends Module {
  static dependencies = {
    soulShardEvents: SoulShardEvents,
    combatants: Combatants,
  };

  fragmentsGained = 0;
  fragmentsWasted = 0;
  fragmentsSpent = 0;

  //stores number of shards gained/spent/wasted per ability ID
  generatedAndWasted = {
    [SPELLS.IMMOLATE_DEBUFF.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.CONFLAGRATE.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.INCINERATE.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DIMENSIONAL_RIFT_CAST.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOULSNATCHER_FRAGMENT_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOUL_CONDUIT_TALENT.id]: {
      generated: 0,
      wasted: 0,
    },
    [SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id]: {
      generated: 0,
      wasted: 0,
    },
  };

  spent = {
    [SPELLS.CHAOS_BOLT.id]: 0,
    [SPELLS.RAIN_OF_FIRE_CAST.id]: 0,
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

  on_soulshardfragment_gained(event) {
    const spellId = event.ability.guid;
    if (!this.generatedAndWasted[spellId]) {
      //shouldn't happen
      return;
    }

    this.generatedAndWasted[spellId].wasted += event.waste;
    this.generatedAndWasted[spellId].generated += event.amount;
    this.fragmentsWasted += event.waste;
    this.fragmentsGained += event.amount;
  }

  on_soulshardfragment_spent(event) {
    const spellId = event.ability.guid;
    if (this.spent[spellId] === undefined) {
      //shouldn't happen
      return;
    }
    this.spent[spellId] += event.amount;
    this.fragmentsSpent += event.amount;
  }
}

export default SoulShardTracker;
