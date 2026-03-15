import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#FF0000';

class Corruption extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;
  private activeDot!: typeof SPELLS.CORRUPTION_DEBUFF;

  // Determine which DoT was actually used
  constructor(options: Options) {
    super(options);

    this.activeDot = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.WITHER_TALENT)
      ? SPELLS.WITHER_DEBUFF
      : SPELLS.CORRUPTION_DEBUFF;
  }
  get uptime() {
    const uptime = this.enemies.getBuffUptime(this.activeDot.id);
    return uptime / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(this.activeDot.id);
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
      spells: [this.activeDot],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
      perf: this.DowntimePerformance,
    });
  }
}

export default Corruption;
