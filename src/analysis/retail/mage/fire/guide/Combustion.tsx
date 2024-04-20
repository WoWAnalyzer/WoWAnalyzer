import { ReactNode } from 'react';
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
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/fire/Guide';
import CombustionActiveTime from '../core/CombustionActiveTime';
import CombustionCasts from '../core/Combustion';
import FeelTheBurn from '../talents/FeelTheBurn';

class CombustionGuide extends Analyzer {
  static dependencies = {
    combustionActiveTime: CombustionActiveTime,
    combustion: CombustionCasts,
    feelTheBurn: FeelTheBurn,
  };

  protected combustionActiveTime!: CombustionActiveTime;
  protected combustion!: CombustionCasts;
  protected feelTheBurn!: FeelTheBurn;

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

  get castDelay() {
    const castDelay = this.combustion.combustionCastDelayThresholds.actual;
    const thresholds = this.combustion.combustionCastDelayThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (castDelay < thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (castDelay < thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (castDelay < thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get fireballCasts() {
    const fireballs = this.combustion.fireballCastsDuringCombustion();
    const thresholds = this.combustion.fireballDuringCombustionThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (fireballs <= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (fireballs <= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (fireballs <= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get activeTimeData() {
    const data: BoxRowEntry[] = [];
    this.combustionActiveTime.activeTime.forEach((cb) => {
      if (cb.analysis && cb.analysis.tooltip) {
        const tooltip = this.generateGuideTooltip(
          cb.analysis.value,
          cb.analysis.tooltip,
          cb.buffStart,
        );
        data.push({ value: cb.analysis.value, tooltip });
      }
    });
    return data;
  }

  get feelTheBurnData() {
    const data: BoxRowEntry[] = [];
    this.feelTheBurn.stackUptime.forEach((ftb) => {
      if (ftb.analysis && ftb.analysis.tooltip) {
        const tooltip = this.generateGuideTooltip(
          ftb.analysis.value,
          ftb.analysis.tooltip,
          ftb.buffStart,
        );
        data.push({ value: ftb.analysis.value, tooltip });
      }
    });
    return data;
  }

  combustionEfficiency() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.COMBUSTION_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  get guideSubsection(): JSX.Element {
    const fireBlast = <SpellLink spell={SPELLS.FIRE_BLAST} />;
    const phoenixFlames = <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} />;
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const scorch = <SpellLink spell={SPELLS.SCORCH} />;
    const fireball = <SpellLink spell={SPELLS.FIREBALL} />;
    const pyroblast = <SpellLink spell={TALENTS.PYROBLAST_TALENT} />;
    const flamestrike = <SpellLink spell={SPELLS.FLAMESTRIKE} />;
    const sunKingsBlessing = <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />;
    const flameAccelerant = <SpellLink spell={TALENTS.FLAME_ACCELERANT_TALENT} />;
    const feelTheBurn = <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />;

    const combustionIcon = <SpellIcon spell={TALENTS.COMBUSTION_TALENT} />;
    const fireballIcon = <SpellIcon spell={SPELLS.FIREBALL} />;

    const explanation = (
      <>
        <div>
          <b>{combustion}</b> is one of the largest contributors to your overall damage and has a
          short duration. When you combine that with the number of instant casts that Fire Mage has
          access to, your {combustion}s will typically involve stuffing as many instant casts into
          that window as possible to get as many {pyroblast} or {flamestrike} casts as possible
          before the buff ends.
        </div>
        <div>
          To get the most out of this cooldown, you should refer to the below rules and guidelines:
          <ul>
            <li>
              Don't leave {combustion} off cooldown for too long, unless the fight or strat requires
              it.
            </li>
            <li>
              Combustion can be cast while casting, so you should activate it as close to the end of
              your hardcast as possible to avoid wasting any of the buff duration (We call this Cast
              Delay).
            </li>
            <li>
              If {combustion} is close to being available, start pooling your {fireBlast} and{' '}
              {phoenixFlames} charges so you have enough to last {combustion}s duration.
            </li>
            <li>
              Eliminate as much downtime as possible while {combustion} is active to get as many{' '}
              {hotStreak}s and {pyroblast}s/{flamestrike}s as possible.
            </li>
            <li>
              Don't hardcast longer abilities like {fireball} (unless you have {flameAccelerant} or{' '}
              {'>'} 100% Haste) or {pyroblast}/{flamestrike} (Unless you have {sunKingsBlessing}).
              You can weave some {scorch} casts in to make your instant casts last longer.
            </li>
            {this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT) && (
              <li>
                Quickly stack {feelTheBurn} to max stacks and keep the buff up for {combustion}s
                entire duration.
              </li>
            )}
          </ul>
        </div>
      </>
    );
    const castDelayTooltip = (
      <>
        {this.combustion.combustionCastDelayThresholds.actual.toFixed(2)} Average Combustion
        Pre-Cast Delay
      </>
    );
    const fireballCastTooltip = (
      <>{this.combustion.fireballCastsDuringCombustion()} Fireball Casts during Combustion</>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Combustion Active Time</strong>
            <PerformanceBoxRow values={this.activeTimeData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <div>
            <strong>Feel the Burn Max Stack Uptime</strong>
            <PerformanceBoxRow values={this.feelTheBurnData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <div style={{ color: qualitativePerformanceToColor(this.castDelay), fontSize: '20px' }}>
            {combustionIcon}{' '}
            <TooltipElement content={castDelayTooltip}>
              {this.combustion.combustionCastDelayThresholds.actual.toFixed(2)}s{' '}
              <small>Average Cast Delay</small>
            </TooltipElement>
          </div>
          <div
            style={{ color: qualitativePerformanceToColor(this.fireballCasts), fontSize: '20px' }}
          >
            {fireballIcon}{' '}
            <TooltipElement content={fireballCastTooltip}>
              {this.combustion.fireballCastsDuringCombustion()}{' '}
              <small>Fireballs Cast During Combustion</small>
            </TooltipElement>
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
