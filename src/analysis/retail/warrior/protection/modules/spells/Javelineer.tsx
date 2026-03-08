import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/warrior';

class Javelineer extends Analyzer {
  wThrow = false;
  sThrow = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.JAVELINEER_TALENT);
    if (!this.active) {
      return;
    }

    this.wThrow = this.selectedCombatant.hasTalent(TALENTS.JAVELINEER_TALENT);
    this.sThrow = this.selectedCombatant.hasTalent(TALENTS.JAVELINEER_TALENT);
  }

  get poorTalentSelection() {
    return !(this.wThrow || this.sThrow);
  }
}

export default Javelineer;
