import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#dd8811';

class SunfireUptime extends Analyzer {
  get suggestionThresholds() {
    const sunfireUptime = this.enemies.getBuffUptime(SPELLS.SUNFIRE.id) / this.owner.fightDuration;
    return {
      actual: sunfireUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.SUNFIRE} /> uptime can be improved. Try to pay more
          attention to your Sunfire on the boss.
        </>,
      )
        .icon(SPELLS.SUNFIRE.icon)
        .actual(
          defineMessage({
            id: 'druid.balance.suggestions.sunfire.uptime',
            message: `${formatPercentage(actual)}% Sunfire uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SUNFIRE.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.SUNFIRE],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default SunfireUptime;
