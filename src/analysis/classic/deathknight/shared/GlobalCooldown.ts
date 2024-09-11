import SPELLS from 'common/SPELLS/classic/deathknight';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const UNHOLY_PRESENCE_GCD_REDUCTION = 500;

/**
 * Unholy presence reduces the GCD of all casts by 0.5 seconds
 */

class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.UNHOLY_PRESENCE.id)) {
      return Math.max(gcd - UNHOLY_PRESENCE_GCD_REDUCTION, this.minDuration);
    }
    return gcd;
  }
}

export default GlobalCooldown;
