import SPELLS from 'common/SPELLS';
import Analyzer, { When } from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';

class FortitudeRaidBuff extends Analyzer {
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.POWER_WORD_FORTITUDE.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: .95,
        average: .90,
        major: 0,
      },
      style: 'percentage',
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest('Remember to have Power Word: Fortitude always up and recast it on death/resurection.')
          .icon(SPELLS.POWER_WORD_FORTITUDE.icon)
          .actual(`${formatPercentage(actual)}% Power Word: Fortitude uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default FortitudeRaidBuff;
