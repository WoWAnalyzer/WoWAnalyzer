import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { Options } from 'parser/core/Analyzer';

const BAR_COLOR = '#4CAF50';

class Immolate extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;
  protected activeDot!: typeof SPELLS.IMMOLATE_DEBUFF | typeof SPELLS.WITHER_DEBUFF;

  constructor(options: Options) {
    super(options);

    this.activeDot = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.WITHER_TALENT)
      ? SPELLS.WITHER_DEBUFF
      : SPELLS.IMMOLATE_DEBUFF;
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

export default Immolate;
