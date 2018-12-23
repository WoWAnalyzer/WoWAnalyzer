import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SPELLS from 'common/SPELLS';
import SteadyFocus from 'parser/hunter/marksmanship/modules/talents/SteadyFocus';

const STEADY_FOCUS_GCD_REDUCTION_PER_STACK = 0.2;

const MIN_GCD = 750;

/**
 * Steady Focus:
 * Using Steady Shot reduces the cast time of Steady Shot by 20%, stacking up to 2 times.  Using any other shot removes this effect.
 */

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    steadyFocus: SteadyFocus,
  };

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RAPID_FIRE.id) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.on_byPlayer_cast(event);
  }

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
