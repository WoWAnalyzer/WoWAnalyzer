import SPELLS from 'common/SPELLS/classic/deathknight';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const UNHOLY_PRESENCE_GCD_REDUCTION = 500;
const ICY_TALONS_GCD_REDUCTION = 0.2;

/**
 * Unholy presence reduces the GCD of all casts by 0.5 seconds
 * Icy Talons reduces the GCD of all casts by 20%
 * Min GCD is 0.75 seconds
 */

class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.UNHOLY_PRESENCE.id)) {
      return Math.max(gcd - UNHOLY_PRESENCE_GCD_REDUCTION, 750);
    }
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.ICY_TALONS_BUFF.id)) {
      return Math.max(gcd * (1 - ICY_TALONS_GCD_REDUCTION), 750);
    }
    return gcd;
  }
}

export default GlobalCooldown;
