import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';

const BAR_COLOR = '#6600CC';

class VampiricTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.VAMPIRIC_TOUCH.id);
  }

  get DowntimePerformance(): QualitativePerformance {
    const downtime = 1 - this.uptime;
    if (downtime <= 0.01) {
      return QualitativePerformance.Perfect;
    }
    if (downtime <= 0.05) {
      return QualitativePerformance.Good;
    }
    if (downtime <= 0.1) {
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
            <SpellIcon key={'Icon-' + SPELLS.VAMPIRIC_TOUCH.name} spell={SPELLS.VAMPIRIC_TOUCH} />{' '}
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

export default VampiricTouch;
