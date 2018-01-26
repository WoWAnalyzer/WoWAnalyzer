import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SoulShardEvents from './SoulShardEvents';

const SHADOWBURN_KILL = 'Shadowburn kill';

class SoulShardTracker extends Analyzer {
  static dependencies = {
    soulShardEvents: SoulShardEvents,
    combatants: Combatants,
  };

  fragmentsGained = 0;
  fragmentsWasted = 0;
  fragmentsSpent = 0;

  // stores number of shards gained/spent/wasted per ability ID
  generatedAndWasted = {
    [SPELLS.IMMOLATE_DEBUFF.name]: {
      id: SPELLS.IMMOLATE_DEBUFF.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.CONFLAGRATE.name]: {
      id: SPELLS.CONFLAGRATE.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SHADOWBURN_TALENT.name]: {
      id: SPELLS.SHADOWBURN_TALENT.id,
      generated: 0,
      wasted: 0,
    },
    [SHADOWBURN_KILL]: {
      id: SPELLS.SHADOWBURN_TALENT.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.INCINERATE.name]: {
      id: SPELLS.INCINERATE.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.DIMENSIONAL_RIFT_CAST.name]: {
      id: SPELLS.DIMENSIONAL_RIFT_CAST.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOULSNATCHER_FRAGMENT_GEN.name]: {
      id: SPELLS.SOULSNATCHER_FRAGMENT_GEN.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.SOUL_CONDUIT_TALENT.name]: {
      id: SPELLS.SOUL_CONDUIT_TALENT.id,
      generated: 0,
      wasted: 0,
    },
    [SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.name]: {
      id: SPELLS.FERETORY_OF_SOULS_FRAGMENT_GEN.id,
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
    const spellName = event.ability.name;
    if (!this.generatedAndWasted[spellName]) {
      // shouldn't happen
      return;
    }
    if (spellName === SPELLS.SHADOWBURN_TALENT.name && event.isFromShadowburnKill) {
      this.generatedAndWasted[SHADOWBURN_KILL].wasted += event.waste;
      this.generatedAndWasted[SHADOWBURN_KILL].generated += event.amount;
    } else {
      this.generatedAndWasted[spellName].wasted += event.waste;
      this.generatedAndWasted[spellName].generated += event.amount;
    }
    this.fragmentsWasted += event.waste;
    this.fragmentsGained += event.amount;
  }

  on_soulshardfragment_spent(event) {
    const spellId = event.ability.guid;
    if (this.spent[spellId] === undefined) {
      // shouldn't happen
      return;
    }
    this.spent[spellId] += event.amount;
    this.fragmentsSpent += event.amount;
  }
}

export default SoulShardTracker;
