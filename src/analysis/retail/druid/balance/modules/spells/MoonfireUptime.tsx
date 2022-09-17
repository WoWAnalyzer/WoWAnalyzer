import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

class MoonfireUptime extends Analyzer {
  get suggestionThresholds() {
    const moonfireUptime =
      this.enemies.getBuffUptime(SPELLS.MOONFIRE_DEBUFF.id) / this.owner.fightDuration;
    return {
      actual: moonfireUptime,
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
          Your <SpellLink id={SPELLS.MOONFIRE_DEBUFF.id} /> uptime can be improved. Try to pay more
          attention to your Moonfire on the boss.
        </>,
      )
        .icon(SPELLS.MOONFIRE_DEBUFF.icon)
        .actual(
          t({
            id: 'druid.balance.suggestions.moonfire.uptime',
            message: `${formatPercentage(actual)}% Moonfire uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_DEBUFF.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.MOONFIRE_DEBUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default MoonfireUptime;
