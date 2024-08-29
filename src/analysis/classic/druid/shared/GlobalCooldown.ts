import SPELLS from 'common/SPELLS/classic/druid';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Shooting Stars buff makes Starsurge an instant cast with Min GCD
 */

class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.SHOOTING_STARS.id)) {
      return this.minDuration;
    }
    return gcd;
  }
}

export default GlobalCooldown;
