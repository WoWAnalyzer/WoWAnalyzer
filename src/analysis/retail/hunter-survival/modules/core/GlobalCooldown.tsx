import { MIN_GCD } from 'analysis/retail/hunter';
import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  getGlobalCooldownDuration(spellId: number) {
    let gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId === SPELLS.WILD_SPIRITS.id) {
      gcd = gcd / (1 + this.haste.current);
    }
    return Math.max(MIN_GCD, gcd);
  }
}

export default GlobalCooldown;
