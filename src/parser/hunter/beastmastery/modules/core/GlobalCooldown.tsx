import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SPELLS from 'common/SPELLS';
import Haste from 'parser/shared/modules/Haste';
import { MAX_GCD, MIN_GCD } from 'parser/hunter/shared/constants';
import { AOTW_GCD_REDUCTION_AFFECTED_ABILITIES } from '../../constants';

const ASPECT_GCD_REDUCTION = 200;

/**
 * Aspect of the wild reduces Global Cooldown for certain spells by 0.2 seconds before haste calculations
 */
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (AOTW_GCD_REDUCTION_AFFECTED_ABILITIES.includes(spellId) && this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      const unhastedAspectGCD = MAX_GCD - ASPECT_GCD_REDUCTION;
      const hastepercent = 1 + this.haste.current;
      return Math.max(MIN_GCD, unhastedAspectGCD / hastepercent);
    }
    return Math.max(MIN_GCD, gcd);
  }

}

export default GlobalCooldown;
