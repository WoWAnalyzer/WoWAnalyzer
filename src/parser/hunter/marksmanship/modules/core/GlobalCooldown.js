import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import StatTracker from 'parser/shared/modules/StatTracker';
import Channeling from 'parser/shared/modules/Channeling';
import SPELLS from 'common/SPELLS';
import Haste from 'parser/shared/modules/Haste';
import SteadyFocus from 'parser/hunter/marksmanship/modules/talents/SteadyFocus';
import Abilities from '../Abilities';

const STEADY_FOCUS_GCD_REDUCTION_PER_STACK = 0.2;

const MIN_GCD = 750;

/**
 * Steady Focus:
 * Using Steady Shot reduces the cast time of Steady Shot by 20%, stacking up to 2 times.  Using any other shot removes this effect.
 */

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
    statTracker: StatTracker,
    channeling: Channeling,
    steadyFocus: SteadyFocus,
  };

  getGlobalCooldownDuration(spellId) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId && spellId === SPELLS.STEADY_SHOT.id && this.selectedCombatant.hasBuff(SPELLS.STEADY_FOCUS_BUFF.id)) {
      const steadyFocusMultiplier = 1 - STEADY_FOCUS_GCD_REDUCTION_PER_STACK * this.steadyFocus.steadyFocusStacks;
      return Math.max(MIN_GCD, (gcd * steadyFocusMultiplier));
    }
    return Math.max(MIN_GCD, gcd);
  }

}

export default GlobalCooldown;
