import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest('Remember to have Power Word: Fortitude always up and recast it on death/resurection.')
          .icon(SPELLS.POWER_WORD_FORTITUDE.icon)
          .actual(i18n._(t('priest.holy.suggestions.fortitudeRaidBuff.uptime')`${formatPercentage(actual)}% Power Word: Fortitude uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }
}

export default FortitudeRaidBuff;
