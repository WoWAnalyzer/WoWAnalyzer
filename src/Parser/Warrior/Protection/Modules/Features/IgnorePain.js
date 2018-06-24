import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

class IgnorePain extends Analyzer {

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IGNORE_PAIN.id) / this.owner.fightDuration;
  }


  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }
}

export default IgnorePain;
