import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/fire/Guide';
import HotStreak from '../core/HotStreak';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

const LOW_BLAST_CHARGES = 1;

class HotStreakGuide extends Analyzer {
  static dependencies = {
    hotStreak: HotStreak,
  };

  protected hotStreak!: HotStreak;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipItems: { perf: QualitativePerformance; detail: string }[],
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}
        </div>
        <div>
          {tooltipItems.map((t, i) => (
            <div key={i}>
              <PerformanceMark perf={t.perf} /> {t.detail}
              <br />
            </div>
          ))}
        </div>
      </>
    );
    return tooltip;
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

  get hotStreakData() {
    const data: BoxRowEntry[] = [];
    this.hotStreak.hotStreaks.forEach((hs) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      if (hs.expired) {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: `Hot Streak Proc Expired` });
      }

      const lowBlastCharges = hs.blastCharges <= LOW_BLAST_CHARGES;
      if (hs.precast && !lowBlastCharges) {
        tooltipItems.push({
          perf: QualitativePerformance.Ok,
          detail: `Precast Found with Fire Blast or Phoenix Flames Charges Available`,
        });
      }

      if (hs.critBuff.active && hs.critBuff.buffId) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `Had Guaranteed Crit Buff: ${hs.critBuff.buffId === TALENTS.SCORCH_TALENT.id ? 'Searing Touch' : SPELLS[hs.critBuff.buffId].name}`,
        });
      }

      let overallPerf = QualitativePerformance.Fail;
      if (hs.expired) {
        overallPerf = QualitativePerformance.Fail;
      } else if (hs.precast && !lowBlastCharges) {
        overallPerf = QualitativePerformance.Ok;
      } else if (!hs.precast || (hs.precast && lowBlastCharges && lowBlastCharges)) {
        overallPerf = QualitativePerformance.Good;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, hs.remove.timestamp);
        data.push({ value: overallPerf, tooltip });
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

    const hotStreakIcon = <SpellIcon spell={SPELLS.HOT_STREAK} />;

    const explanation = (
      <>
        <div>
          <b>{hotStreak}</b> makes your next {pyroblast} or {flamestrike} instant cast, making it a
          large contributor to your direct damage and your ticking {ignite} damage. Because of this,
          the majority of your rotation revolves around getting as many of these procs as possible,
        </div>
        <div>
          <ul>
            <li>Use your procs and don't let them expire.</li>
            <li>
              You can't generate {heatingUp} while you have {hotStreak}, so spend {hotStreak}{' '}
              quickly to avoid a wasted crit that could have given you a {heatingUp}.
            </li>
            <li>
              If low on charges outside of {combustion} you can cast {fireball}, or {pyroblast} with
              , immediately before spending {hotStreak} to get an increased chance of fishing for{' '}
              {heatingUp} or {hotStreak}.
            </li>
          </ul>
        </div>
      </>
    );
    const wastedCritTooltip = <>{this.hotStreak.wastedCrits} Wasted Crits</>;
    const data = (
      <div>
        <span
          style={{
            color: qualitativePerformanceToColor(this.wastedCritsPerMinute),
            fontSize: '18px',
          }}
        >
          {hotStreakIcon}{' '}
          <TooltipElement content={wastedCritTooltip}>
            {this.hotStreak.wastedCritsThresholds.actual.toFixed(2)}{' '}
            <small>wasted crits per minute</small>
          </TooltipElement>
        </span>
        <div>
          <br />
          <CastSummaryAndBreakdown spell={SPELLS.HOT_STREAK} castEntries={this.hotStreakData} />
        </div>
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
