import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

class IgnorePain extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.IGNORE_PAIN.id) / this.owner.fightDuration;
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
