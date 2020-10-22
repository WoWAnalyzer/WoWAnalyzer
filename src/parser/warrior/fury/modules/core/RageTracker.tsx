import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

const VENGEANCE_RAGE_REDUCTION = 0.33; //percent
const RAGE_GEN_FROM_MELEE_HIT_ICD = 1000; //ms
const RAGE_PER_MELEE_HIT = 2;
const RAGE_PER_MELEE_HIT_TAKEN = 3;

class RageTracker extends ResourceTracker {
  vengeanceRageSaved: number = 0;
  lastMeleeTaken: number = 0;

  maxResource: number = 100;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamageTaken);
  }

  getReducedCost(event: CastEvent) {

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

  onDamage(event: DamageEvent) {
    this.processInvisibleEnergize(SPELLS.RAGE_AUTO_ATTACKS.id, RAGE_PER_MELEE_HIT);
  }

  onDamageTaken(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.DODGE || event.hitType === HIT_TYPES.PARRY) {
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
