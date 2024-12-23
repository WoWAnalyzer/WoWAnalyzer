import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark, qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { SpellSeq } from 'parser/ui/SpellSeq';

import TouchOfTheMagi, { TouchOfTheMagiCast } from '../talents/TouchOfTheMagi';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';

const MAX_ARCANE_CHARGES = 4;

class TouchOfTheMagiGuide extends Analyzer {
  static dependencies = {
    touchOfTheMagi: TouchOfTheMagi,
  };

  protected touchOfTheMagi!: TouchOfTheMagi;

  activeTimeUtil(activePercent: number) {
    const thresholds = this.touchOfTheMagi.touchMagiActiveTimeThresholds.isLessThan;
    let performance = QualitativePerformance.Good;
    if (activePercent >= thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (activePercent >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (activePercent >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  private perCastBreakdown(cast: TouchOfTheMagiCast): React.ReactNode {
    const header = (
      <>
        @ {this.owner.formatTimestamp(cast.applied)} &mdash;{' '}
        <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />
      </>
    );

    const checklistItems: CooldownExpandableItem[] = [];

    const noCharges = cast.charges === 0;
    const maxCharges = cast.charges === MAX_ARCANE_CHARGES;
    checklistItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s Before Touch
        </>
      ),
      result: <PassFailCheckmark pass={noCharges || (maxCharges && cast.refundBuff)} />,
      details: (
        <>
          {cast.charges} {cast.refundBuff ? '(Refund)' : ''}
        </>
      ),
    });

    const activeTime = cast.activeTime;
    checklistItems.push({
      label: (
        <>
          Active Time Percent during <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />
        </>
      ),
      result: <PerformanceMark perf={this.activeTimeUtil(activeTime || 0)} />,
      details: <>{formatPercentage(activeTime || 0, 2)}%</>,
    });

    const overallPerf =
      (noCharges || (maxCharges && cast.refundBuff)) && activeTime
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;

    return (
      <CooldownExpandable
        header={header}
        checklistItems={checklistItems}
        perf={overallPerf}
        key={cast.ordinal}
      />
    );
  }

  get guideSubsection(): JSX.Element {
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />;
    const burdenOfPower = <SpellLink spell={TALENTS.BURDEN_OF_POWER_TALENT} />;
    const gloriousIncandescence = <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />;
    const intuition = <SpellLink spell={SPELLS.INTUITION_BUFF} />;
    const touchOfTheMagiIcon = <SpellIcon spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{touchOfTheMagi}</b> is a short debuff available for each burn phase and grants you 4{' '}
          {arcaneCharge}s and accumulates 20% of your damage for the duration. When the debuff
          expires it explodes dealing damage to the target and reduced damage to nearby targets.
        </div>
        <div>
          <ul>
            <li>
              Using the standard rotation, cast as many spells as possible at the debuffed target
              until the debuff expires.
            </li>
            <li>
              Spend your {arcaneCharge}s with {arcaneBarrage} and then cast {touchOfTheMagi} while{' '}
              {arcaneBarrage}
              is in the air for some extra damage. cast
              {touchOfTheMagi} while {arcaneBarrage} is in the air. This should be done even if your
              charges will be refunded anyway via {burdenOfPower}, {gloriousIncandescence}, or{' '}
              {intuition}.
            </li>
            <li>
              Major Burn Phase: Ensure you have {siphonStorm} and {netherPrecision}. Your cast
              sequence would typically be{' '}
              <SpellSeq
                spells={[
                  TALENTS.EVOCATION_TALENT,
                  TALENTS.ARCANE_MISSILES_TALENT,
                  TALENTS.ARCANE_SURGE_TALENT,
                  SPELLS.ARCANE_BARRAGE,
                  TALENTS.TOUCH_OF_THE_MAGI_TALENT,
                ]}
              />
              . If you don't have 4 {arcaneCharge}s, cast {arcaneOrb} before {arcaneSurge}.
            </li>
            <li>
              Minor Burn Phase: {evocation} and {arcaneSurge} will not be available, but if possible
              you should go into {touchOfTheMagi} with {netherPrecision}.
            </li>
            <li>
              Use {presenceOfMind} at the end of {touchOfTheMagi} to squeeze in a couple more{' '}
              {arcaneBlast} casts.
            </li>
          </ul>
        </div>
      </>
    );
    const activeTimeTooltip = (
      <>
        {formatPercentage(this.touchOfTheMagi.averageActiveTime)}% average Active Time per Touch of
        the Magi cast.
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{
              color: qualitativePerformanceToColor(
                this.activeTimeUtil(this.touchOfTheMagi.averageActiveTime),
              ),
              fontSize: '20px',
            }}
          >
            {touchOfTheMagiIcon}{' '}
            <TooltipElement content={activeTimeTooltip}>
              {formatPercentage(this.touchOfTheMagi.averageActiveTime)}%{' '}
              <small>Average Active Time</small>
            </TooltipElement>
          </div>
          <div>
            <p>
              <strong>Per-Cast Breakdown</strong>
              <small> - click to expand</small>
              {this.touchOfTheMagi.touchCasts.map((cast) => this.perCastBreakdown(cast))}
            </p>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Touch of the Magi',
    );
  }
}

export default TouchOfTheMagiGuide;
