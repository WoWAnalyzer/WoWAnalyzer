import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  castToMaxCpTimestamp;

  on_initialized() {
    this.resource = RESOURCE_TYPES.COMBO_POINTS;

    this.maxResource = 5;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // some point generating spells do not have energize events so they are handled here
    if ([SPELLS.THRASH_FERAL.id, SPELLS.CAT_SWIPE.id, SPELLS.BRUTAL_SLASH_TALENT.id].includes(spellId)) {
      this.processInvisibleEnergize(spellId, 1);
    }

    // set bonus can proc "free Ferocious Bite that counts as if it spent the full 5 CPs"
    // the energy cost is properly missing from the cast, but the CP cost shows very strangely. (amount: x, max: 5, cost: 5) where x is the amount of CPs you had on cast.
    // Returning before this CP cost can be processed to avoid messing up the results
    if (spellId === SPELLS.FEROCIOUS_BITE.id && !event.classResources.find(res => res.type === RESOURCE_TYPES.ENERGY.id)) {
      return;
    }

    super.on_byPlayer_cast(event);
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;

    const notMaxBefore = this.current !== this.maxResource;
    super.on_toPlayer_energize(event);
    const maxAfter = this.current === this.maxResource;

    // we don't want to count primal fury procs that happen right after a cast that brought us to max CP to count as waste, because it wasn't controlled.
    // procced Primal Fury appears to always appear after the energize that procced it, and always on the same timestamp
    if (notMaxBefore && maxAfter) {
      this.castToMaxCpTimestamp = event.timestamp;
    } else if (spellId === SPELLS.PRIMAL_FURY.id && event.timestamp === this.castToMaxCpTimestamp) {
      this.buildersObj[SPELLS.PRIMAL_FURY.id].wasted -= 1;
    }
  }
}

export default ComboPointTracker;
