import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

const RAGE_GEN_FROM_MELEE_HIT_ICD = 1000; //ms
const RAGE_PER_MELEE_HIT_TAKEN = 3;

class RageTracker extends ResourceTracker {
  lastMeleeTaken = 0;

  maxResource = 100;

  ragePerMeleeHit: number = 2;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;
    if (this.selectedCombatant.hasTalent(SPELLS.WAR_MACHINE_TALENT_PROTECTION.id)) {
      this.ragePerMeleeHit += 1;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamage);
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(SPELLS.MELEE),
      this.onDamageTaken,
    );
  }

  getReducedCost(event: CastEvent) {
    if (event.resourceCost && event.resourceCost[this.resource.id] !== undefined) {
      return event.resourceCost[this.resource.id];
    }
    const resource = super.getResource(event);
    if (!resource) {
      return;
    }
    return resource.cost ? resource.cost / 10 : 0;
  }

  onDamage(event: DamageEvent) {
    this.processInvisibleEnergize(SPELLS.RAGE_AUTO_ATTACKS.id, this.ragePerMeleeHit);
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
}

export default RageTracker;
