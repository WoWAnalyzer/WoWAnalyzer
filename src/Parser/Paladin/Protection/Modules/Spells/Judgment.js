import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

const REDUCTION_TIME_REGULAR = 2000; // ms
const REDUCTION_TIME_CRIT = 4000; // ms

/**
 * Judges the target dealing (250% of Spell power) Holy damage, and reducing the remaining cooldown on Shield of the Righteous by 2 sec, or 4 sec on a critical strike.
 */
class Judgment extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.JUDGMENT_CAST.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id)) {
      // Nope, I did not verify if blocked crits count as crits for this trait, I just assumed it. Please do test if you can and report back or fix this comment.
      const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
      const reduction = isCrit ? REDUCTION_TIME_CRIT : REDUCTION_TIME_REGULAR;
      this.spellUsable.reduceCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, reduction);
    }
  }
}

export default Judgment;
