import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';

class IgnorePain extends Analyzer {
  get uptime(): number {
    return this.selectedCombatant.getBuffUptime(SPELLS.IGNORE_PAIN.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default IgnorePain;
