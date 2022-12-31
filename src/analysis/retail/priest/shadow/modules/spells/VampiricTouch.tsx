import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

class VampiricTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime can be improved. Try to pay more
          attention to your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> on the boss.
        </span>,
      )
        .icon(SPELLS.VAMPIRIC_TOUCH.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.vampiricTouch.uptime',
            message: `${formatPercentage(actual)}% Vampiric Touch uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.VAMPIRIC_TOUCH.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.VAMPIRIC_TOUCH],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default VampiricTouch;
