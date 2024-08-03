import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';

class ArcaneTempo extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT);
  }

  get buffUptimeMS() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_TEMPO_BUFF.id);
  }

  get buffUptimePercent() {
    return this.buffUptimeMS / this.owner.fightDuration;
  }

  get arcaneTempoUptimeThresholds() {
    return {
      actual: this.buffUptimePercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  //ADD STATISTIC
}

export default ArcaneTempo;
