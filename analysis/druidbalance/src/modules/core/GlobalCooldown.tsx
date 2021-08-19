import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const ECLIPSE_HASTE_MULT = 0.85;

/**
 * Eclipse reduces the cast time (and GCD) of the effected filler by 15%
 */
class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (
      this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id) &&
      spellId === SPELLS.WRATH_MOONKIN.id
    ) {
      return Math.max(gcd * ECLIPSE_HASTE_MULT, 750);
    }
    if (this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_LUNAR.id) && spellId === SPELLS.STARFIRE.id) {
      return Math.max(gcd * ECLIPSE_HASTE_MULT, 750);
    }
    return gcd;
  }
}

export default GlobalCooldown;
