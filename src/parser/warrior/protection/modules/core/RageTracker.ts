import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

const RAGE_GEN_FROM_MELEE_HIT_ICD = 1000; //ms
const RAGE_PER_MELEE_HIT_TAKEN = 3;

class RageTracker extends ResourceTracker {
  lastMeleeTaken = 0;

  maxResource = 100;

  ragePerMeleeHit: number = 2;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;
    if(this.selectedCombatant.hasTalent(SPELLS.WAR_MACHINE_PROTECTION_TALENT.id)){
      this.ragePerMeleeHit += 1;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamage);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamageTaken);
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
