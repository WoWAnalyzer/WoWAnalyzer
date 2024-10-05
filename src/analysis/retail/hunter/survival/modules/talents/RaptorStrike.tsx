import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

/**
 * A vicious slash dealing (70% of Attack power) Physical damage.
 *
 * Example log with timeline warning:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class RaptorStrike extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active =
      !this.selectedCombatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.VIPERS_VENOM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.RAPTOR_STRIKE_TALENT, SPELLS.RAPTOR_STRIKE_AOTE]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      addInefficientCastReason(event, "Viper's Venom buff still active.");
    }
  }
}

export default RaptorStrike;
