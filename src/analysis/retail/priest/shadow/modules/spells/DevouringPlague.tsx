import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

class DevouringPlague extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      this.enemies.getBuffUptime(TALENTS.DEVOURING_PLAGUE_TALENT.id) / this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.6,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} /> uptime can be improved. Try to
          pay more attention to your <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} /> on the
          boss.
        </span>,
      )
        .icon(TALENTS.DEVOURING_PLAGUE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Devouring Plauge uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(TALENTS.DEVOURING_PLAGUE_TALENT.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [TALENTS.DEVOURING_PLAGUE_TALENT],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default DevouringPlague;
