import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';

class SurgeOfPower extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_POWER_TALENT);
    if (!this.active) {
      return;
    }
  }
}

export default SurgeOfPower;
