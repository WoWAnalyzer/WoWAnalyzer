import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const VENGEANCE_RAGE_REDUCTION = 0.35; //percent
const IGNORE_PAIN_MAX_COST = 60;

class RageTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  vengeanceRageSaved = 0;

  on_initialized() {
    this.resource = RESOURCE_TYPES.RAGE;
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost / 10;
    const abilityId = event.ability.guid;
    if (abilityId === SPELLS.REVENGE.id) {
      if (this.combatants.selected.hasBuff(SPELLS.VENGEANCE_REVENGE.id, event.timestamp)) {
        const newCost = cost * (1 - VENGEANCE_RAGE_REDUCTION);
        this.vengeanceRageSaved += cost - newCost;
        cost = newCost;
      }
    } else if (abilityId === SPELLS.IGNORE_PAIN.id) {
      if (this.combatants.selected.hasBuff(SPELLS.VENGEANCE_IGNORE_PAIN.id, event.timestamp)) {
        const currentRage = this.getResource(event).amount / 10;
        const newCost = currentRage >= IGNORE_PAIN_MAX_COST * (1 - VENGEANCE_RAGE_REDUCTION) ? IGNORE_PAIN_MAX_COST * (1 - VENGEANCE_RAGE_REDUCTION) : currentRage;
        const normalCost = currentRage >= IGNORE_PAIN_MAX_COST ? IGNORE_PAIN_MAX_COST : currentRage;

        this.vengeanceRageSaved += normalCost - newCost;
        cost = newCost;
        //use either the max reduced max cost 39 Rage if enough rage was available or use all the available rage
        //WCL return the wrong rage cost for a cast with Vengeance up (with 60+ rage available 46 instead of 39 (60 * 0.65))
      }
    }
    return cost;
  }

  get rageSavedByVengeance() {
    return this.vengeanceRageSaved.toFixed(0);
  }

}

export default RageTracker;
