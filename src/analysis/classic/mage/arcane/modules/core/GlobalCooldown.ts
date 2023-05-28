import SPELLS from 'common/SPELLS/classic/mage';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'analysis/classic/mage/shared/Haste';

const GCD_REDUCTION = 500;

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (gcd && this.selectedCombatant.hasBuff(SPELLS.PRESENCE_OF_MIND.id)) {
      return Math.max(gcd - GCD_REDUCTION, 750);
    }
    return gcd;
  }
}

export default GlobalCooldown;
