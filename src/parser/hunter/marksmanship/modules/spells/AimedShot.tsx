import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';

/**
 * A powerful aimed shot that deals [(248.4% of Attack power) * ((max(0, min(Level - 10, 10)) * 8 + 130) / 210)] Physical damage.
 *
 * Example log: https://www.warcraftlogs.com/reports/v6nrtTxNKGDmYJXy#fight=16&type=auras&source=6
 *
 */
class AimedShot extends Analyzer {

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (event.meta === undefined) {
      event.meta = {
        isEnhancedCast: false,
        isInefficientCast: false,
      };
    }

    const hasPreciseShotsBuff = this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS.id);
    const hasTrueshotBuff = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id);

    if (hasPreciseShotsBuff && !hasTrueshotBuff) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Aimed Shot while having Precise Shots stacks left.';
    }
  }

}

export default AimedShot;
