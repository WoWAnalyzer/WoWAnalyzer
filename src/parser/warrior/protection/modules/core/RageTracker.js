import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';

const VENGEANCE_RAGE_REDUCTION = 0.33; //percent
const RAGE_GEN_FROM_MELEE_HIT_ICD = 1000; //ms
const RAGE_PER_MELEE_HIT = 2;
const RAGE_PER_MELEE_HIT_TAKEN = 3;

class RageTracker extends ResourceTracker {
  vengeanceRageSaved = 0;
  lastMeleeTaken = 0;

  maxResource = 100;

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.RAGE;
  }

  getReducedCost(event) {

    if (!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost / 10;
    const abilityId = event.ability.guid;
    if (abilityId === SPELLS.REVENGE.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.VENGEANCE_REVENGE.id, event.timestamp)) {
        const newCost = cost * (1 - VENGEANCE_RAGE_REDUCTION);
        this.vengeanceRageSaved += cost - newCost;
        cost = newCost;
      }
    } else if (abilityId === SPELLS.IGNORE_PAIN.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.VENGEANCE_IGNORE_PAIN.id, event.timestamp)) {
        const newCost = cost * (1 - VENGEANCE_RAGE_REDUCTION);
        this.vengeanceRageSaved += cost - newCost;
        cost = newCost;
      }
    }
    return cost;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.MELEE.id) {
      return;
    }

    this.processInvisibleEnergize(SPELLS.RAGE_AUTO_ATTACKS.id, RAGE_PER_MELEE_HIT);
  }

  on_toPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.MELEE.id || event.hitType === HIT_TYPES.DODGE || event.hitType === HIT_TYPES.PARRY) {
      return;
    }

    if (event.timestamp - this.lastMeleeTaken >= RAGE_GEN_FROM_MELEE_HIT_ICD) {
      this.processInvisibleEnergize(SPELLS.RAGE_DAMAGE_TAKEN.id, RAGE_PER_MELEE_HIT_TAKEN);
      this.lastMeleeTaken = event.timestamp;
    }
  }

  get rageSavedByVengeance() {
    return this.vengeanceRageSaved.toFixed(0);
  }
}

export default RageTracker;
