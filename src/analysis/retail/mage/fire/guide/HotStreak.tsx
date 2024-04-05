import { ReactNode } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import HotStreak from '../core/HotStreak';

class HotStreakGuide extends Analyzer {
  static dependencies = {
    hotStreak: HotStreak,
  };

  protected hotStreak!: HotStreak;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipText: ReactNode,
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}: {tooltipText}
        </div>
      </>
    );
    return tooltip;
  }

  get procUtilization() {
    const utilPercent = this.hotStreak.hotStreakUtilizationThresholds.actual;
    const minorThreshold = this.hotStreak.hotStreakUtilizationThresholds.isLessThan.minor;
    const averageThreshold = this.hotStreak.hotStreakUtilizationThresholds.isLessThan.average;
    const majorThreshold = this.hotStreak.hotStreakUtilizationThresholds.isLessThan.major;
    let performance = QualitativePerformance.Fail;
    if (utilPercent > minorThreshold) {
      performance = QualitativePerformance.Perfect;
    } else if (utilPercent > averageThreshold) {
      performance = QualitativePerformance.Good;
    } else if (utilPercent > majorThreshold) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get wastedCritsPerMinute() {
    const wastedPerMin = this.hotStreak.wastedCritsThresholds.actual;
    const minorThreshold = this.hotStreak.wastedCritsThresholds.isGreaterThan.minor;
    const averageThreshold = this.hotStreak.wastedCritsThresholds.isGreaterThan.average;
    const majorThreshold = this.hotStreak.wastedCritsThresholds.isGreaterThan.major;
    let performance = QualitativePerformance.Fail;
    if (wastedPerMin < minorThreshold) {
      performance = QualitativePerformance.Perfect;
    } else if (wastedPerMin < averageThreshold) {
      performance = QualitativePerformance.Good;
    } else if (wastedPerMin < majorThreshold) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get preCastData() {
    const data: BoxRowEntry[] = [];
    this.hotStreak.hotStreaks.forEach((hs) => {
      if (hs.preCastMissing && hs.preCastMissing.tooltip) {
        const tooltip = this.generateGuideTooltip(
          hs.preCastMissing.performance,
          hs.preCastMissing.tooltip,
          hs.remove.timestamp,
        );
        data.push({ value: hs.preCastMissing.performance, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const heatingUp = <SpellLink spell={SPELLS.HEATING_UP} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const fireball = <SpellLink spell={SPELLS.FIREBALL} />;
    const pyroblast = <SpellLink spell={TALENTS.PYROBLAST_TALENT} />;
    const flamestrike = <SpellLink spell={SPELLS.FLAMESTRIKE} />;
    const ignite = <SpellLink spell={SPELLS.IGNITE} />;
    const firestarter = <SpellLink spell={TALENTS.FIRESTARTER_TALENT} />;
    const searingTouch = <SpellLink spell={TALENTS.SEARING_TOUCH_TALENT} />;
    const sunKingsBlessing = <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />;

    const hotStreakIcon = <SpellIcon spell={SPELLS.HOT_STREAK} />;

    const explanation = (
      <>
        <div>
          <b>{hotStreak}</b> is the more important of the two procs, in that it allows you to make
          your next {pyroblast} or {flamestrike} instant cast. These spells are the primary source
          of your direct damage as well as a major contributor towards your ticking {ignite} damage,
          so you want to ensure you are generating as many of them as possible.
        </div>
        <div>
          To accomplish this, you should refer to the below rules and guidelines:
          <ul>
            <li>Use your procs and don't let them expire.</li>
            <li>
              You can't generate {heatingUp} while you have {hotStreak}, so spend {hotStreak}{' '}
              quickly to avoid a wasted crit that could have given you a {heatingUp}.
            </li>
            <li>
              Unless you are guaranteed to crit ({combustion}, {firestarter}, {searingTouch}), spend{' '}
              {hotStreak} at the end of a cast like {fireball} or {pyroblast} (with{' '}
              {sunKingsBlessing}). If both crit you get a new {hotStreak}, if only one crits you
              still get a {heatingUp} regardless of which one crit or the order they landed.
            </li>
          </ul>
        </div>
      </>
    );
    const expiredProcTooltip = <>{this.hotStreak.expiredProcs()} Expired Procs.</>;
    const wastedCritTooltip = <>{this.hotStreak.wastedCrits()} Wasted Crits</>;
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.procUtilization), fontSize: '20px' }}
          >
            {hotStreakIcon}{' '}
            <TooltipElement content={expiredProcTooltip}>
              {formatPercentage(this.hotStreak.hotStreakUtilizationThresholds.actual, 0)} %{' '}
              <small>utilization</small>
            </TooltipElement>
          </div>
          <div
            style={{ color: qualitativePerformanceToColor(this.procUtilization), fontSize: '20px' }}
          >
            {hotStreakIcon}{' '}
            <TooltipElement content={wastedCritTooltip}>
              {this.hotStreak.wastedCritsThresholds.actual.toFixed(2)}{' '}
              <small>Wasted Crits Per Minute</small>
            </TooltipElement>
          </div>
          <strong>Cast details</strong>
          <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          <PerformanceBoxRow values={this.preCastData} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Hot Streak',
    );
  }
}

export default HotStreakGuide;
