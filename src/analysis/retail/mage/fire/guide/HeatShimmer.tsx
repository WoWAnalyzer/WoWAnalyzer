import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import HeatShimmer, { HeatShimmerProcs } from '../talents/HeatShimmer';
import { formatDurationMillisMinSec } from 'common/format';
import { CastOverview } from 'interface/guide/components';

class HeatShimmerGuide extends Analyzer {
  static dependencies = {
    heatShimmer: HeatShimmer,
  };
  protected heatShimmer!: HeatShimmer;

  private buildStats() {
    const stats = [];

    stats.push({
      value: `${formatDurationMillisMinSec(this.heatShimmer.averageUptime)}`,
      label: 'Average Uptime',
      tooltip: (
        <>The average amount of time Heat Shimmer was active before it was spent or expired.</>
      ),
    });
    stats.push({
      value: `${this.heatShimmer.expiredProcs}`,
      label: 'Expired Procs',
      tooltip: <>Number of procs that expired before they could be spent.</>,
      performance: this.heatShimmer.expiredProcsPerformance,
    });

    return stats;
  }

  private evaluateHeatShimmer(hs: HeatShimmerProcs): CastEvaluation {
    // FAIL CONDITIONS
    if (!hs.spender) {
      return {
        timestamp: hs.buffApply!.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Heat Shimmer proc expired.',
      };
    }

    // GOOD CONDITIONS
    if (hs.spender) {
      return {
        timestamp: hs.buffApply!.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Heat Shimmer proc spent.',
      };
    }

    // DEFAULT
    return {
      timestamp: hs.buffApply!.timestamp,
      performance: QualitativePerformance.Fail,
      reason: 'Unknown Performance Condition (Please report this)',
    };
  }

  get guideSubsection(): JSX.Element {
    const heatShimmer = <SpellLink spell={TALENTS.HEAT_SHIMMER_TALENT} />;
    const ignite = <SpellLink spell={SPELLS.IGNITE} />;
    const scorch = <SpellLink spell={TALENTS.SCORCH_TALENT} />;

    const explanation = (
      <>
        <b>{heatShimmer}</b> is a buff that has a chance to proc from your {ignite} ticks, making
        your next {scorch} cast instant and treated as if the target is under 30% health
        (guaranteeing that it crits). Make sure you use this proc quickly so that it does not expire
        or get munched.
      </>
    );

    return (
      <GuideSection spell={TALENTS.HEAT_SHIMMER_TALENT} explanation={explanation}>
        <CastOverview spell={TALENTS.HEAT_SHIMMER_TALENT} stats={this.buildStats()} />
        <CastSummary
          spell={TALENTS.HEAT_SHIMMER_TALENT}
          casts={this.heatShimmer.procs.map((hs) => this.evaluateHeatShimmer(hs))}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default HeatShimmerGuide;
