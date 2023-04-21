import SPELLS from 'common/SPELLS/classic/warlock';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const MC_GCD_REDUCTION = 0.3;
const MIN_GCD = 750;

/**
 * Molten Core reduces the GCD of Incinerate by 30%
 * Min GCD is 750 ms
 */

class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    const incinerate = spellId === SPELLS.INCINERATE.id;
    const mcBuff = this.selectedCombatant.hasBuff(SPELLS.MOLTEN_CORE_BUFF.id);
    if (gcd && incinerate && mcBuff) {
      return Math.max(gcd * (1 - MC_GCD_REDUCTION), MIN_GCD);
    }
    return gcd;
  }
}

export default GlobalCooldown;
