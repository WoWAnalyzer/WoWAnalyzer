import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Channeling from 'Parser/Core/Modules/Channeling';
import SPELLS from 'common/SPELLS';
import Haste from 'Parser/Core/Modules/Haste';
import SteadyFocus from 'Parser/Hunter/Marksmanship/Modules/Talents/SteadyFocus';
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

  stacks = 0;

  getGlobalCooldownDuration(spellId) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId && spellId === SPELLS.STEADY_SHOT.id && this.selectedCombatant.hasBuff(SPELLS.STEADY_FOCUS_BUFF.id)) {
      this.stacks = this.steadyFocus.getSteadyFocusStacks;
      return Math.max(MIN_GCD, (gcd * (1 - (STEADY_FOCUS_GCD_REDUCTION_PER_STACK * this.stacks))) / (1 + this.statTracker.currentHastePercentage));
    }
    return Math.max(MIN_GCD, gcd);
  }

}

export default GlobalCooldown;
