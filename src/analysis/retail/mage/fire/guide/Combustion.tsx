import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/fire/Guide';
import CombustionCasts from '../core/Combustion';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { GetRelatedEvent } from 'parser/core/Events';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

class CombustionGuide extends Analyzer {
  static dependencies = {
    combustion: CombustionCasts,
  };

  protected combustion!: CombustionCasts;

  hasFlameAccelerant: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ACCELERANT_TALENT);

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

  activeTimeUtil(activePercent: number) {
    const thresholds = this.combustion.activeTimeThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (activePercent >= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (activePercent >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (activePercent >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  castDelayUtil(delay: number) {
    const thresholds = this.combustion.combustionCastDelayThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (delay <= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (delay <= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (delay <= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get combustionData() {
    const data: BoxRowEntry[] = [];
    this.combustion.combustCasts.forEach((cb) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      const combustDuration = cb.remove - cb.cast.timestamp;
      const activeTimePercent = cb.activeTime / combustDuration;
      const activeUtil = this.activeTimeUtil(activeTimePercent);
      tooltipItems.push({
        perf: activeUtil,
        detail: `Active Time: ${formatDurationMillisMinSec(cb.activeTime, 2)} / ${formatDurationMillisMinSec(cb.remove - cb.cast.timestamp, 2)} (${formatPercentage(activeTimePercent, 2)}%)`,
      });

      const fireballCasts = cb.spellCasts.filter((sc) => {
        if (sc.ability.guid !== SPELLS.FIREBALL.id) {
          return false;
        }
        const beginCast = GetRelatedEvent(sc, 'CastBegin');
        const hasAccelerantBuff = this.selectedCombatant.hasBuff(
          SPELLS.FLAME_ACCELERANT_BUFF.id,
          sc.timestamp,
        );
        if (
          this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, beginCast?.timestamp) &&
          !hasAccelerantBuff
        ) {
          return true;
        } else {
          return false;
        }
      });
      if (fireballCasts.length > 0) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `Fireballs During Combust: ${fireballCasts}`,
        });
      }

      const delayUtil = this.castDelayUtil(cb.castDelay);
      tooltipItems.push({
        perf: delayUtil,
        detail: `Combustion Cast Delay: ${formatDurationMillisMinSec(cb.castDelay, 3)}`,
      });

      const perfect = [QualitativePerformance.Perfect];
      const good = [...perfect, QualitativePerformance.Good];
      const ok = [...good, QualitativePerformance.Ok];

      let overallPerf = QualitativePerformance.Fail;
      if (fireballCasts.length > 0) {
        overallPerf = QualitativePerformance.Fail;
      } else if (perfect.includes(activeUtil) && perfect.includes(delayUtil)) {
        overallPerf = QualitativePerformance.Perfect;
      } else if (good.includes(activeUtil) && good.includes(delayUtil)) {
        overallPerf = QualitativePerformance.Good;
      } else if (ok.includes(activeUtil) && ok.includes(delayUtil)) {
        overallPerf = QualitativePerformance.Ok;
      } else if (
        activeUtil === QualitativePerformance.Fail ||
        delayUtil === QualitativePerformance.Fail
      ) {
        overallPerf = QualitativePerformance.Fail;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, cb.cast.timestamp);
        data.push({ value: overallPerf, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const fireBlast = <SpellLink spell={SPELLS.FIRE_BLAST} />;
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const scorch = <SpellLink spell={SPELLS.SCORCH} />;
    const fireball = <SpellLink spell={SPELLS.FIREBALL} />;
    const pyroblast = <SpellLink spell={TALENTS.PYROBLAST_TALENT} />;
    const flamestrike = <SpellLink spell={SPELLS.FLAMESTRIKE} />;
    const flameAccelerant = <SpellLink spell={TALENTS.FLAME_ACCELERANT_TALENT} />;
    const feelTheBurn = <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />;

    const combustionIcon = <SpellIcon spell={TALENTS.COMBUSTION_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{combustion}</b> is a very strong burst cooldown with a short duration. So, to maximize
          your burst when {combustion} is active, you should try to use as many instant casts as
          possible before {combustion} ends to maximize the number of {hotStreak}s you can gain and
          spend before
          {combustion} ends.
        </div>
        <div>
          <ul>
            <li>
              Don't leave {combustion} off cooldown for too long, unless the fight or strat requires
              it.
            </li>
            <li>
              Combustion can be cast while casting, so you activate it as close to the end of your
              hardcast as possible to avoid wasting any of the buff duration (We call this Cast
              Delay).
            </li>
            <li>
              If {combustion} is almost available, start pooling {fireBlast} charges so you have
              enough to last {combustion}s duration.
            </li>
            <li>
              Spend as many {hotStreak}s as possible during {combustion} and avoid any downtime.
            </li>
            <li>
              Don't hardcast abilities like {fireball} (
              {this.hasFlameAccelerant ? `without ${flameAccelerant} or ` : `with > 100% Haste`}) or{' '}
              {pyroblast}/{flamestrike}
              {scorch} if running low on charges.
            </li>
            {this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT) && (
              <li>
                Get max stacks of {feelTheBurn} and maintain it for {combustion}'s duration.
              </li>
            )}
          </ul>
        </div>
      </>
    );
    const castDelayTooltip = (
      <>{this.combustion.averageCastDelay.toFixed(2)}s Average Combustion Pre-Cast Delay</>
    );
    const activeTimeTooltip = (
      <>
        {formatDurationMillisMinSec(this.combustion.totalActiveTime)} Active of{' '}
        {formatDurationMillisMinSec(this.combustion.totalCombustDuration)}
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{
              color: qualitativePerformanceToColor(
                this.activeTimeUtil(this.combustion.overallActivePercent),
              ),
              fontSize: '20px',
            }}
          >
            {combustionIcon}{' '}
            <TooltipElement content={activeTimeTooltip}>
              {this.combustion.overallActivePercent.toFixed(2)}s{' '}
              <small>Overall Combustion Active Time</small>
            </TooltipElement>
          </div>
          <div
            style={{
              color: qualitativePerformanceToColor(
                this.castDelayUtil(this.combustion.averageCastDelay),
              ),
              fontSize: '20px',
            }}
          >
            {combustionIcon}{' '}
            <TooltipElement content={castDelayTooltip}>
              {this.combustion.averageCastDelay.toFixed(2)}s <small>Average Cast Delay</small>
            </TooltipElement>
          </div>
          <div>
            <CastSummaryAndBreakdown
              spell={TALENTS.COMBUSTION_TALENT}
              castEntries={this.combustionData}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Combustion',
    );
  }
}

export default CombustionGuide;
