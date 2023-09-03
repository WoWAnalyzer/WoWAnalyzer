import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { Options } from 'parser/core/Analyzer';
import CoreHaste from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.FRENZY_TALENT)) {
      Haste.HASTE_BUFFS[SPELLS.FRENZY.id] = { hastePerStack: 0.02 };
    }

    const STRIKES_RANKS =
      this.selectedCombatant.getTalentRank(TALENTS.WILD_STRIKES_TALENT) +
      this.selectedCombatant.getTalentRank(TALENTS.SWIFT_STRIKES_TALENT);

    if (STRIKES_RANKS > 0) {
      this._triggerChangeHaste(
        null,
        this.current,
        Haste.addHaste(this.current, STRIKES_RANKS * 0.01),
      );
    }
  }
}

export default Haste;
