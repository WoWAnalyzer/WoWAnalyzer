import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';
import { SpellIcon } from 'interface';

const BAR_COLOR = '#dd8811';

/*
  Shadow word pain can be created by:

  Hard casting
  Misery
  Dark Void

  Shadow Word pain can be refreshed by:

  Hard casting
  Misery
  Dark Void
  Void Bolt
 */
class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  lastCastTimestamp = 0;
  castedShadowWordPains = 0;
  appliedShadowWordPains = 0;
  refreshedShadowWordPains = 0;
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SHADOW_WORD_PAIN.id);
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
            <SpellIcon
              key={'Icon-' + SPELLS.SHADOW_WORD_PAIN.name}
              spell={SPELLS.SHADOW_WORD_PAIN}
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

export default ShadowWordPain;
