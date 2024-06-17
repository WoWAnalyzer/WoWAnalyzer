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
import HeatingUp from '../core/HeatingUp';

class HeatingUpGuide extends Analyzer {
  static dependencies = {
    heatingUp: HeatingUp,
  };

  protected heatingUp!: HeatingUp;

  get fireBlastUtil() {
    const util = this.heatingUp.fireBlastUtilSuggestionThresholds.actual;
    const thresholds = this.heatingUp.fireBlastUtilSuggestionThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util > thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (util > thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util > thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get phoenixFlamesUtil() {
    const util = this.heatingUp.phoenixFlamesUtilSuggestionThresholds.actual;
    const thresholds = this.heatingUp.phoenixFlamesUtilSuggestionThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util > thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (util > thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util > thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get guideSubsection(): JSX.Element {
    const fireBlast = <SpellLink spell={SPELLS.FIRE_BLAST} />;
    const phoenixFlames = <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} />;
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const heatingUp = <SpellLink spell={SPELLS.HEATING_UP} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const firestarter = <SpellLink spell={TALENTS.FIRESTARTER_TALENT} />;
    const searingTouch = <SpellLink spell={TALENTS.SCORCH_TALENT} />;
    const alexstraszasFury = <SpellLink spell={TALENTS.ALEXSTRASZAS_FURY_TALENT} />;

    const fireBlastIcon = <SpellIcon spell={SPELLS.FIRE_BLAST} />;
    const phoenixFlamesIcon = <SpellIcon spell={TALENTS.PHOENIX_FLAMES_TALENT} />;

    const explanation = (
      <>
        <div>
          While <b>{heatingUp}</b> is not as impactful as {hotStreak}, it is important to properly
          manage your {heatingUp} procs to get as many {hotStreak} procs as possible throughout the
          fight.
        </div>
        <div>
          To accomplish this, you should refer to the below rules and guidelines:
          <ul>
            <li>
              Use guaranteed crit abilities like {fireBlast} or {phoenixFlames} (with{' '}
              {alexstraszasFury}) to convert {heatingUp} to {hotStreak}
            </li>
            <li>
              Unless you are guaranteed to crit ({combustion}, {firestarter}, {searingTouch}), or
              are capped on charges, don't use your guaranteed crit abilities without {heatingUp}.
            </li>
          </ul>
        </div>
      </>
    );
    const fireBlastTooltip = (
      <>
        {this.heatingUp.fireBlastWithoutHeatingUp} Fire Blast casts without Heating Up.
        <br />
        {this.heatingUp.fireBlastsDuringHotStreak} Fire Blasts cast during Hot Streak
      </>
    );
    const phoenixFlamesTooltip = (
      <>{this.heatingUp.phoenixFlamesDuringHotStreak} Phoenix Flames casts during Hot Streak</>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.fireBlastUtil), fontSize: '20px' }}
          >
            {fireBlastIcon}{' '}
            <TooltipElement content={fireBlastTooltip}>
              {formatPercentage(this.heatingUp.fireBlastUtilPercent, 0)} %{' '}
              <small>Fire Blast Utilization</small>
            </TooltipElement>
          </div>
          <div
            style={{
              color: qualitativePerformanceToColor(this.phoenixFlamesUtil),
              fontSize: '20px',
            }}
          >
            {phoenixFlamesIcon}{' '}
            <TooltipElement content={phoenixFlamesTooltip}>
              {formatPercentage(this.heatingUp.phoenixFlamesUtilPercent, 0)} %{' '}
              <small>Phoenix Flames Utilization</small>
            </TooltipElement>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Heating Up',
    );
  }
}

export default HeatingUpGuide;
