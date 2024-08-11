import SPELLS from 'common/SPELLS/classic/mage';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const GCD_REDUCTION = 500;
const MIN_GCD = 1000;

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
  };

  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.PRESENCE_OF_MIND.id)) {
      return Math.max(gcd - GCD_REDUCTION, MIN_GCD);
    }
    // Glyph of Arcane Power
    // While Arcane Power is active the GCD of Blink, Mana Shield, and Mirror Image is zero
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
      if (
        spellId === SPELLS.MIRROR_IMAGE.id ||
        spellId === SPELLS.BLINK.id ||
        spellId === SPELLS.MANA_SHIELD.id
      ) {
        return 0;
      }
    }
    return gcd;
  }
}

export default GlobalCooldown;
