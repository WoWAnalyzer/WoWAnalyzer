import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import * as SPELLS from 'analysis/classic/priest/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class DivineSpiritRaidBuff extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.PRAYER_OF_SPIRIT) + this.selectedCombatant.getBuffUptime(SPELLS.DIVINE_SPIRIT) /
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

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        'Remember to have DivineSpirit always up and recast it on death/resurection.',
      )
        .icon('spell_holy_divinespirit')
        .actual(
          t({
            id: 'priest.holy.suggestions.divineSpiritRaidBuff.uptime',
            message: `${formatPercentage(actual)}% Divine Spirit uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default DivineSpiritRaidBuff;
