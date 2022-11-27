import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

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
        .actual(
          t({
            id: 'priest.shadow.suggestions.devouringPlague.uptime',
            message: `${formatPercentage(actual)}% Devouring Plauge uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(TALENTS.DEVOURING_PLAGUE_TALENT.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)}% <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default DevouringPlague;
