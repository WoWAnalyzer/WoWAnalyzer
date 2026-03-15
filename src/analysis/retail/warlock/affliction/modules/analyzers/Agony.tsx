import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { JSX } from 'react';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

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

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            {' '}
            Keep <SpellLink spell={SPELLS.AGONY} /> active on as many targets as possible.
          </b>
        </p>
        <p>
          Maintaining <SpellLink spell={SPELLS.AGONY} /> uptime is crucial for generating Soul
          Shards, as it is your primary source of shards outside of talents. High uptime also
          ensures consistent DoT damage.
        </p>
        {this.DowntimePerformance === QualitativePerformance.Ok && (
          <p style={{ color: 'orange' }}>
            Your Agony uptime is average. Try to refresh it more consistently.
          </p>
        )}
        {this.DowntimePerformance === QualitativePerformance.Fail && (
          <p style={{ color: 'red' }}>
            Your Agony uptime is low! Focus on keeping it applied at all times.
          </p>
        )}
      </>
    );

    const data = <RoundedPanel>{this.subStatistic()}</RoundedPanel>; // ✅ fixed

    return explanationAndDataSubsection(explanation, data);
  }
}

export default Agony;
