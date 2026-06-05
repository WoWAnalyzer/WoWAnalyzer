import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9C27B0'; //purple for agony

class Agony extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptime(): number {
    const uptime = this.enemies.getBuffUptime(SPELLS.AGONY.id);
    return uptime / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.AGONY.id);
  }

  get DowntimePerformance(): QualitativePerformance {
    const downtime = 1 - this.uptime;
    if (downtime <= 0.01) return QualitativePerformance.Perfect;
    if (downtime <= 0.05) return QualitativePerformance.Good;
    if (downtime <= 0.1) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.AGONY],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
      perf: this.DowntimePerformance,
    });
  }
}

export default Agony;
