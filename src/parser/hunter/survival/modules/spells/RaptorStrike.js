import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';

/**
 * A vicious slash dealing (70% of Attack power) Physical damage.
 *
 * Example log: https://www.warcraftlogs.com/reports/BjmyHd9zt8RYJrWA/#fight=3&source=1
 */

class RaptorStrike extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RAPTOR_STRIKE.id) {
      return;
    }
    if (event.meta === undefined) {
      event.meta = {
        isEnhancedCast: false,
        isInefficientCast: false,
        enhancedCastReason: '',
        inefficientCastReason: '',
      };
    }
    if (this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Viper\'s Venom buff still active.';
    }
  }
}

export default RaptorStrike;
