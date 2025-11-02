import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';

class FortitudeRaidBuff extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.POWER_WORD_FORTITUDE.id) /
      this.owner.fightDuration
    );
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default FortitudeRaidBuff;
