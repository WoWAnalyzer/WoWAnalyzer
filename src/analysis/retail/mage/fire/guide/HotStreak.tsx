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
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/fire/Guide';
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
    const utilPercent = this.hotStreak.badUsePercent;
    const thresholds = this.hotStreak.castBeforeHotStreakThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (utilPercent > thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (utilPercent > thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (utilPercent > thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get wastedCritsPerMinute() {
    const wastedPerMin = this.hotStreak.wastedCritsThresholds.actual;
    const thresholds = this.hotStreak.wastedCritsThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (wastedPerMin < thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (wastedPerMin < thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (wastedPerMin < thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get preCastData() {
    const data: BoxRowEntry[] = [];
    this.hotStreak.hotStreaks.forEach((hs) => {
      if (hs.preCastMissing && hs.preCastMissing.tooltip) {
        const tooltip = this.generateGuideTooltip(
          hs.preCastMissing.value,
          hs.preCastMissing.tooltip,
          hs.remove.timestamp,
        );
        data.push({ value: hs.preCastMissing.value, tooltip });
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
    const searingTouch = <SpellLink spell={TALENTS.SCORCH_TALENT} />;
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
    const utilizationTooltip = (
      <>
        {this.hotStreak.expiredProcs()} Expired Procs.
        <br />
        {this.hotStreak.missingPreCasts} Missing Pre Cast
      </>
    );
    const wastedCritTooltip = <>{this.hotStreak.wastedCrits()} Wasted Crits</>;
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.procUtilization), fontSize: '20px' }}
          >
            {hotStreakIcon}{' '}
            <TooltipElement content={utilizationTooltip}>
              {formatPercentage(this.hotStreak.badUsePercent, 0)} % <small>utilization</small>
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
          <div>
            <strong>Hot Streak Details</strong>
            <PerformanceBoxRow values={this.preCastData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
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
