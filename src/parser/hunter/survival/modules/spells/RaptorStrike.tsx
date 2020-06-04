import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';

/**
 * A vicious slash dealing (70% of Attack power) Physical damage.
 *
 * Example log with timeline warning:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class RaptorStrike extends Analyzer {

  constructor(options: any) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) && this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RAPTOR_STRIKE.id) {
      return;
    }
    if (event.meta === undefined) {
      event.meta = {
        isInefficientCast: false,
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
