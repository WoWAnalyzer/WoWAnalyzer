import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { Options } from 'parser/core/Analyzer';
import CoreHaste from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.FRENZY_TALENT)) {
      this.addHasteBuff(SPELLS.FRENZY.id, { hastePerStack: 0.02 });
    }

    const STRIKES_RANKS =
      this.selectedCombatant.getTalentRank(TALENTS.WILD_STRIKES_TALENT) +
      this.selectedCombatant.getTalentRank(TALENTS.SWIFT_STRIKES_TALENT);

    if (STRIKES_RANKS > 0) {
      // For each rank of Wild Strikes and Swift Strikes, you gain an additional 1% Haste.
      // We do this "manually" since there is no buff associated with this.
      const newHaste = Haste.addHaste(this.current, STRIKES_RANKS * 0.01);
      this._triggerChangeHaste(null, this.current, newHaste);
      this.current = newHaste;
    }
  }
}

export default Haste;
