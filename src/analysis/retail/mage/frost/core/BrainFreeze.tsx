import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Flurry from 'analysis/retail/mage/frost/talents/Flurry';

class BrainFreeze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    flurry: Flurry,
  };

  protected flurry!: Flurry;
  protected enemies!: Enemies;

  brainFreezeRefreshes = 0;
  brainFreeze: { apply: ApplyBuffEvent; remove: RemoveBuffEvent | undefined; expired: boolean }[] =
    [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this.onBrainFreeze,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this.onBrainFreezeRefresh,
    );
  }

  onBrainFreeze(event: ApplyBuffEvent) {
    const remove: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const spender: CastEvent | undefined = remove && GetRelatedEvent(remove, 'SpellCast');
    this.brainFreeze.push({
      apply: event,
      remove: remove || undefined,
      expired: !spender,
    });
  }

  onBrainFreezeRefresh(event: RefreshBuffEvent) {
    this.brainFreezeRefreshes += 1;
  }

  get overlappedFlurries() {
    return this.flurry.flurryEvents.filter((f) => f.overlapped).length;
  }

  get expiredProcs() {
    return this.brainFreeze.filter((bf) => bf.expired).length;
  }

  get totalProcs() {
    return this.brainFreeze.length;
  }

  get wastedProcs() {
    return this.brainFreezeRefreshes + this.expiredProcs;
  }

  get wastedPercent() {
    return this.wastedProcs / this.totalProcs || 0;
  }

  get utilPercent() {
    return 1 - this.wastedPercent;
  }

  get brainFreezeUtilizationThresholds() {
    return {
      actual: this.utilPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get utilizationPerformance() {
    const thresholds = this.brainFreezeUtilizationThresholds;
    let performance = QualitativePerformance.Perfect;
    if (thresholds.actual < thresholds.isLessThan.major) {
      performance = QualitativePerformance.Fail;
    } else if (thresholds.actual < thresholds.isLessThan.average) {
      performance = QualitativePerformance.Ok;
    } else if (thresholds.actual < thresholds.isLessThan.minor) {
      performance = QualitativePerformance.Good;
    }
    return performance;
  }

  get overwrittenPercentage() {
    return this.brainFreezeRefreshes / this.totalProcs || 0;
  }

  // Percentages lowered from .00, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
  get brainFreezeOverwrittenThresholds() {
    return {
      actual: this.overwrittenPercentage,
      isGreaterThan: {
        minor: 0.0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get overwrittenPerformance() {
    const thresholds = this.brainFreezeOverwrittenThresholds;
    return this.thresholdsGreaterThanToQualitativePerformance(thresholds);
  }

  get expiredPercentage() {
    return this.expiredProcs / this.totalProcs || 0;
  }

  // there's almost never an excuse to let BF expire
  get brainFreezeExpiredThresholds() {
    return {
      actual: this.expiredPercentage,
      isGreaterThan: {
        minor: 0.0,
        average: 0.03,
        major: 0.06,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get expiredPerformance() {
    const thresholds = this.brainFreezeExpiredThresholds;
    return this.thresholdsGreaterThanToQualitativePerformance(thresholds);
  }

  private thresholdsGreaterThanToQualitativePerformance(thresholds: {
    actual: number;
    isGreaterThan: { average: number; minor: number; major: number };
    style: ThresholdStyle;
  }) {
    let performance = QualitativePerformance.Perfect;
    if (thresholds.actual > thresholds.isGreaterThan.major) {
      performance = QualitativePerformance.Fail;
    } else if (thresholds.actual > thresholds.isGreaterThan.average) {
      performance = QualitativePerformance.Ok;
    } else if (thresholds.actual > thresholds.isGreaterThan.minor) {
      performance = QualitativePerformance.Good;
    }
    return performance;
  }

  get overlappedFlurryThresholds() {
    return {
      actual: this.overlappedFlurries,
      isGreaterThan: {
        average: 0,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.brainFreezeOverwrittenThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You overwrote {formatPercentage(actual)}% of your{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> procs. You should use your{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> procs as soon as possible and avoid
          letting them expire or be overwritten whenever possible. There are not any situations
          where it would be advantageous to hold your{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />.
        </>,
      )
        .icon(TALENTS.BRAIN_FREEZE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% overwritten`)
        .recommended(`Overwriting none is recommended`),
    );
    when(this.brainFreezeExpiredThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You allowed {formatPercentage(actual)}% of your{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> procs to expire. Make sure you are using
          your procs as soon as possible to avoid this.
        </>,
      )
        .icon(TALENTS.BRAIN_FREEZE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% expired`)
        .recommended(`Letting none expire is recommended`),
    );
    when(this.overlappedFlurryThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.FLURRY_TALENT} /> and applied{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> while the target still had the{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> debuff on them {this.overlappedFlurries} times.
          Casting <SpellLink spell={TALENTS.FLURRY_TALENT} /> applies 2 stacks of{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> to the target so you should always ensure you
          are spending both stacks before you cast <SpellLink spell={TALENTS.FLURRY_TALENT} /> and
          apply <SpellLink spell={SPELLS.WINTERS_CHILL} /> again.
        </>,
      )
        .icon(TALENTS.FLURRY_TALENT.icon)
        .actual(`${formatNumber(actual)} casts`)
        .recommended(`Casting none is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            You got {this.totalProcs} total procs.
            <ul>
              <li>{this.totalProcs - this.expiredProcs - this.brainFreezeRefreshes} used</li>
              <li>{this.brainFreezeRefreshes} overwritten</li>
              <li>{this.expiredProcs} expired</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.BRAIN_FREEZE_TALENT}>
          {formatPercentage(this.utilPercent, 0)}% <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const brainFreeze = <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />;
    const brainFreezeIcon = <SpellIcon spell={TALENTS.BRAIN_FREEZE_TALENT} />;

    const explanation = (
      <>
        You should use your {brainFreeze} procs as soon as possible and avoid letting them expire or
        be overwritten whenever possible. There are not any situations where it would be
        advantageous to hold your {brainFreeze}.
      </>
    );

    const utilizationTooltip = (
      <>
        {this.totalProcs - this.wastedProcs}/{this.totalProcs} procs utilized
      </>
    );
    const overwrittenTooltip = <>{this.brainFreezeRefreshes} procs</>;

    const expiredTooltip = <>{this.expiredProcs} procs</>;

    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{
              color: qualitativePerformanceToColor(this.utilizationPerformance),
              fontSize: '20px',
            }}
          >
            {brainFreezeIcon}{' '}
            <TooltipElement content={utilizationTooltip}>
              {formatPercentage(this.utilPercent, 0)} % <small>utilization</small>
            </TooltipElement>
          </div>

          <div
            style={{
              color: qualitativePerformanceToColor(this.overwrittenPerformance),
              fontSize: '20px',
            }}
          >
            {brainFreezeIcon}{' '}
            <TooltipElement content={overwrittenTooltip}>
              {formatPercentage(this.overwrittenPercentage, 0)} % <small>overwritten</small>
            </TooltipElement>
          </div>

          <div
            style={{
              color: qualitativePerformanceToColor(this.expiredPerformance),
              fontSize: '20px',
            }}
          >
            {brainFreezeIcon}{' '}
            <TooltipElement content={expiredTooltip}>
              {formatPercentage(this.expiredPercentage, 0)} % <small>expired</small>
            </TooltipElement>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Brain Freeze',
    );
  }
}

export default BrainFreeze;
