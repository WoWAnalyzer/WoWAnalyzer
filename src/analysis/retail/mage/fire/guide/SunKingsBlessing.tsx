import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/fire/Guide';
import SunKingsBlessing from '../talents/SunKingsBlessing';

class SunKingsBlessingGuide extends Analyzer {
  static dependencies = {
    sunKingsBlessing: SunKingsBlessing,
  };

  protected sunKingsBlessing!: SunKingsBlessing;

  get expiredProcs() {
    const expired = this.sunKingsBlessing.sunKingExpireThresholds.actual;
    const thresholds = this.sunKingsBlessing.sunKingExpireThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (expired <= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (expired <= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (expired <= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get wastedHotStreaks() {
    const wasted = this.sunKingsBlessing.hotStreaksWithSKBThresholds.actual;
    const thresholds = this.sunKingsBlessing.hotStreaksWithSKBThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (wasted < thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (wasted < thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (wasted < thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get resetCombustion() {
    const resets = this.sunKingsBlessing.combustionDuringCombustionThresholds.actual;
    const thresholds = this.sunKingsBlessing.combustionDuringCombustionThresholds.isGreaterThan;
    let performance = QualitativePerformance.Fail;
    if (resets <= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (resets <= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (resets <= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get guideSubsection(): JSX.Element {
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const pyroblast = <SpellLink spell={TALENTS.PYROBLAST_TALENT} />;
    const fireBlast = <SpellLink spell={SPELLS.FIRE_BLAST} />;
    const phoenixFlames = <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} />;
    const sunKingsBlessing = <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />;

    const sunKingsBlessingIcon = <SpellIcon spell={TALENTS.SUN_KINGS_BLESSING_TALENT} />;
    const hotStreakIcon = <SpellIcon spell={SPELLS.HOT_STREAK} />;
    const combustionIcon = <SpellIcon spell={TALENTS.COMBUSTION_TALENT} />;

    const explanation = (
      <>
        <div>
          Because <b>{sunKingsBlessing}</b> gives you {combustion}, you typically treat this talent
          similarly to {combustion} with a few changes/exceptions. Additionally, {sunKingsBlessing}{' '}
          can be used to extend an existing {combustion} to make it last longer.
        </div>
        <div>
          Follow the same rules and guidelines as {combustion} with the below adjustments and
          additions:
          <ul>
            <li>Do not let {sunKingsBlessing} expire (if possible)</li>
            <li>
              Do not delay activating your {sunKingsBlessing} (even if {combustion} is coming off
              cooldown soon).
            </li>
            <li>
              You should still pool {fireBlast} and {phoenixFlames} for {sunKingsBlessing}, but you
              will not need as many charges since the {combustion} buff will be shorter.
            </li>
            <li>
              If you are activating {sunKingsBlessing} and {combustion} at the same time, make sure{' '}
              {combustion} is activated BEFORE the hardcast {pyroblast} for {sunKingsBlessing}{' '}
              finishes. If {combustion} is cast first, then {sunKingsBlessing} will extend the
              duration of {combustion} (12s + 6s), but if {combustion} is activated after{' '}
              {sunKingsBlessing}, then the buff duration will be reset to 12s.
            </li>
          </ul>
        </div>
      </>
    );
    const expiredTooltip = (
      <>{this.sunKingsBlessing.sunKingExpireThresholds.actual} Expired Procs.</>
    );
    const wastedHotStreakTooltip = (
      <>{this.sunKingsBlessing.hotStreaksWithSKBThresholds.actual.toFixed(2)} Wasted Hot Streaks</>
    );
    const combustResetTooltip = (
      <>{this.sunKingsBlessing.combustionDuringCombustionThresholds.actual} Reset Combustions</>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.expiredProcs), fontSize: '20px' }}
          >
            {sunKingsBlessingIcon}{' '}
            <TooltipElement content={expiredTooltip}>
              {formatPercentage(this.sunKingsBlessing.sunKingExpireThresholds.actual, 0)} %{' '}
              <small>Expired Buffs</small>
            </TooltipElement>
          </div>
          <div
            style={{
              color: qualitativePerformanceToColor(this.wastedHotStreaks),
              fontSize: '20px',
            }}
          >
            {hotStreakIcon}{' '}
            <TooltipElement content={wastedHotStreakTooltip}>
              {this.sunKingsBlessing.hotStreaksWithSKBThresholds.actual.toFixed(2)}{' '}
              <small>Wasted Hot Streaks Per SKB</small>
            </TooltipElement>
          </div>
          <div
            style={{ color: qualitativePerformanceToColor(this.resetCombustion), fontSize: '20px' }}
          >
            {combustionIcon}{' '}
            <TooltipElement content={combustResetTooltip}>
              {this.sunKingsBlessing.combustionDuringCombustionThresholds.actual}{' '}
              <small>Combustion Durations Reset</small>
            </TooltipElement>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      "Sun King's Blessing",
    );
  }
}

export default SunKingsBlessingGuide;
