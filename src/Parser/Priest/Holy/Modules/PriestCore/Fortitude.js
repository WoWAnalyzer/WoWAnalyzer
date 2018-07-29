import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage } from 'common/format';

class Fortitude extends Analyzer {

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.POWER_WORD_FORTITUDE.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Remember to have Power Word: Fortitude always up and recast it on death/resurection.')
          .icon(SPELLS.POWER_WORD_FORTITUDE.icon)
          .actual(`${formatPercentage(actual)}% Power Word: Fortitude uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

}

export default Fortitude;
