import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellIcon } from 'interface';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';

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
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> uptime can be improved. Try to
          pay more attention to your <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> on the
          boss.
        </span>,
      )
        .icon(TALENTS.DEVOURING_PLAGUE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.devouringPlague.uptime',
            message: `${formatPercentage(actual)}% Devouring Plauge uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(TALENTS.DEVOURING_PLAGUE_TALENT.id);
  }

  get DowntimePerformance(): QualitativePerformance {
    const downtime = 1 - this.uptime;
    if (downtime <= 0.1) {
      return QualitativePerformance.Perfect;
    }
    if (downtime <= 0.2) {
      return QualitativePerformance.Good;
    }
    if (downtime <= 0.3) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  subStatistic() {
    const fight = this.owner.fight;
    const totalFightTime = fight.end_time - fight.start_time;
    const primaryUptime = this.getCombinedUptime(this.uptimeHistory);

    return (
      <div className="flex-main multi-uptime-bar">
        <div className="flex main-bar">
          <div className="flex-sub bar-label">
            <SpellIcon
              key={'Icon-' + TALENTS.DEVOURING_PLAGUE_TALENT.name}
              spell={TALENTS.DEVOURING_PLAGUE_TALENT}
            />{' '}
            <PerformanceStrong performance={this.DowntimePerformance}>
              {' '}
              {this.formatPercentUptime(primaryUptime, totalFightTime)}{' '}
            </PerformanceStrong>{' '}
          </div>
          <div className="flex-main chart">
            <UptimeBar
              timeTooltip
              uptimeHistory={this.uptimeHistory}
              start={fight.start_time}
              end={fight.end_time}
              barColor={BAR_COLOR}
            />
          </div>
        </div>
      </div>
    );
  }

  getCombinedUptime(uptimes: Uptime[]): number {
    return uptimes.reduce((acc, up) => acc + up.end - up.start, 0);
  }

  formatPercentUptime(uptime: number, total: number): string {
    return formatPercentage(uptime / total, 0) + '%';
  }
}

export default DevouringPlague;
