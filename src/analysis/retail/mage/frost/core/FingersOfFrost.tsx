import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  ApplyBuffStackEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SHATTER_DEBUFFS } from '../../shared';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { qualitativePerformanceToColor } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class FingersOfFrost extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  fingers: {
    apply: ApplyBuffEvent | ApplyBuffStackEvent;
    remove: RemoveBuffEvent | undefined;
    spender: CastEvent | undefined;
    expired: boolean;
    munched: boolean;
    spendDelay: number | undefined;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
  }

  onFingersProc(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    const remove: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const spender: CastEvent | undefined = remove && GetRelatedEvent(remove, 'SpellCast');
    const damage: DamageEvent | undefined = spender && GetRelatedEvent(spender, 'SpellDamage');
    const enemy = damage && this.enemies.getEntity(damage);
    this.fingers.push({
      apply: event,
      remove: remove,
      spender: spender,
      expired: !spender,
      munched:
        SHATTER_DEBUFFS.some((effect) => enemy?.hasBuff(effect.id, damage?.timestamp)) || false,
      spendDelay: spender && spender.timestamp - event.timestamp,
    });
  }

  get expiredProcs() {
    return this.fingers.filter((f) => f.expired).length;
  }

  get averageSpendDelaySeconds() {
    let spendDelay = 0;
    this.fingers.forEach((f) => f.spendDelay && (spendDelay += f.spendDelay));
    return spendDelay / this.fingers.filter((f) => f.spendDelay).length / 1000;
  }

  get usedFingersProcs() {
    return this.totalProcs - this.expiredProcs;
  }

  get munchedProcs() {
    return this.fingers.filter((f) => f.munched).length;
  }

  get totalProcs() {
    return this.fingers.length;
  }

  get munchedPercent() {
    return this.munchedProcs / this.totalProcs;
  }

  get munchedProcsThresholds() {
    return {
      actual: this.munchedPercent,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get munchedPerformance() {
    const thresholds = this.munchedProcsThresholds;
    return this.thresholdsGreaterThanToQualitativePerformance(thresholds);
  }

  get utilizationPercentage() {
    return 1 - this.expiredProcs / this.totalProcs || 0;
  }

  get fingersProcUtilizationThresholds() {
    return {
      actual: this.utilizationPercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get utilizationPerformance() {
    const thresholds = this.fingersProcUtilizationThresholds;
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

  suggestions(when: When) {
    when(this.munchedProcsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted (munched) {this.munchedProcs}{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> procs (
          {formatPercentage(this.munchedPercent)}% of total procs). Because of the way{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> works, this is sometimes unavoidable
          (i.e. you get a proc while you are using a{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> proc), but if you have both a{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> proc and a{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> proc, you should make sure you use
          the <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> procs first before you start
          casting <SpellLink spell={SPELLS.FROSTBOLT} /> and{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} /> to minimize the number of wasted/munched
          procs.
        </>,
      )
        .icon(TALENTS.FINGERS_OF_FROST_TALENT.icon)
        .actual(`${formatPercentage(actual)}% procs wasted`)
        .recommended(formatPercentage(recommended)),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            "Munching" a proc refers to a situation where you have a Fingers of Frost proc at the
            same time that Winters Chill is on the target. This essentially leads to a wasted
            Fingers of Frost proc since Fingers of Frost and Winter's Chill both do the same thing,
            and casting Ice Lance will remove both a Fingers of Frost proc and a stack of Winter's
            Chill. This is sometimes unavoidable, but if you have both a Fingers of Frost proc and a
            Brain Freeze proc, you can minimize this by ensuring that you use the Fingers of Frost
            procs first before you start casting Frostbolt and Flurry to use the Brain Freeze proc.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.FINGERS_OF_FROST_TALENT}>
          {formatPercentage(this.munchedPercent, 0)}% <small>Munched Fingers of Frost procs</small>
          <br />
          {formatNumber(this.averageSpendDelaySeconds)}s <small>Avg. delay to spend procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const fingersOfFrost = <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} />;
    const brainFreeze = <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />;
    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;

    const fingersOfFrostIcon = <SpellIcon spell={TALENTS.FINGERS_OF_FROST_TALENT} />;

    const explanation = (
      <>
        Try to utilize {fingersOfFrost} procs before {brainFreeze} if you have both of them.
        "Munching" a proc refers to a situation where you have a {fingersOfFrost} proc at the same
        time that {wintersChill} is on the target. This essentially leads to a wasted
        {fingersOfFrost} proc since {fingersOfFrost} and {wintersChill} both do the same thing.
        Because of the way {fingersOfFrost} works, this is sometimes unavoidable.
      </>
    );

    const utilizationTooltip = (
      <>
        {this.totalProcs - this.expiredProcs} / {this.totalProcs} procs
      </>
    );

    const munchedTooltip = <>{this.munchedProcs} procs</>;

    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{
              color: qualitativePerformanceToColor(this.utilizationPerformance),
              fontSize: '20px',
            }}
          >
            {fingersOfFrostIcon}{' '}
            <TooltipElement content={utilizationTooltip}>
              {formatPercentage(this.utilizationPercentage, 0)} % <small>utilization</small>
            </TooltipElement>
          </div>
          <div
            style={{
              color: qualitativePerformanceToColor(this.munchedPerformance),
              fontSize: '20px',
            }}
          >
            {fingersOfFrostIcon}{' '}
            <TooltipElement content={munchedTooltip}>
              {formatPercentage(this.munchedPercent, 0)} % <small>munched</small>
            </TooltipElement>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Fingers of Frost',
    );
  }
}

export default FingersOfFrost;
