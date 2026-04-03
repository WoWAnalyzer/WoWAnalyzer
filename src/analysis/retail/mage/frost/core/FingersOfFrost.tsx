import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  EventType,
  CastEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ApplyBuffStackEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { qualitativePerformanceToColor } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ICE_LANCE_SPENDER } from 'analysis/retail/mage/frost/normalizers/CastLinkNormalizer';

class FingersOfFrost extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  fingers: {
    expired: boolean;
    overcapped: boolean;
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
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
  }

  onFingersProc(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    // Ignore buff refreshes that occur automatically when consuming a stack
    if (event.type === EventType.RefreshBuff && GetRelatedEvent(event, 'BuffRemove')) {
      return;
    }
    const removeEvent: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const spender: CastEvent | undefined =
      removeEvent && GetRelatedEvent(removeEvent, ICE_LANCE_SPENDER);
    const fingersStacks: number =
      this.selectedCombatant.getBuff(SPELLS.FINGERS_OF_FROST_BUFF.id, event.timestamp - 10)
        ?.stacks || 0;
    this.fingers.push({
      expired: !spender,
      overcapped: event.type === EventType.RefreshBuff && fingersStacks === 2,
      spendDelay: spender && spender.timestamp - event.timestamp,
    });
  }

  get expiredProcs() {
    return this.fingers.filter((f) => f.expired).length;
  }

  get expiredPercent() {
    return this.expiredProcs / this.totalProcs;
  }

  get averageSpendDelaySeconds() {
    let spendDelay = 0;
    this.fingers.forEach((f) => f.spendDelay && (spendDelay += f.spendDelay));
    return spendDelay / this.fingers.filter((f) => f.spendDelay).length / 1000;
  }

  get usedFingersProcs() {
    return this.totalProcs - this.expiredProcs;
  }

  get overcappedProcs() {
    return this.fingers.filter((f) => f.overcapped).length;
  }

  get totalProcs() {
    return this.fingers.length;
  }

  get overcappedPercent() {
    return this.overcappedProcs / this.totalProcs;
  }

  get wastedProcs() {
    return this.expiredProcs + this.overcappedProcs;
  }

  get utilizationPercentage() {
    return 1 - (this.wastedProcs / this.totalProcs || 0);
  }

  get overcappedPerformance() {
    const overcappedPercent = this.overcappedPercent;
    if (overcappedPercent > 0.1) {
      return QualitativePerformance.Fail;
    } else if (overcappedPercent > 0.05) {
      return QualitativePerformance.Ok;
    } else if (overcappedPercent > 0.025) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Perfect;
  }

  get expiredPerformance() {
    const expiredPercent = this.expiredPercent;
    if (expiredPercent > 0.1) {
      return QualitativePerformance.Fail;
    } else if (expiredPercent > 0.05) {
      return QualitativePerformance.Ok;
    } else if (expiredPercent > 0.025) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Perfect;
  }

  get utilizationPerformance() {
    const utilization = this.utilizationPercentage;
    if (utilization < 0.7) {
      return QualitativePerformance.Fail;
    } else if (utilization < 0.85) {
      return QualitativePerformance.Ok;
    } else if (utilization < 0.95) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Perfect;
  }

  get guideSubsection() {
    const fingersOfFrost = <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} />;
    const fingersOfFrostIcon = <SpellIcon spell={TALENTS.FINGERS_OF_FROST_TALENT} />;

    const explanation = (
      <>
        Try to utilize {fingersOfFrost} procs quickly to avoid overcapping them or letting them
        expire.
      </>
    );

    const utilizationTooltip = (
      <>
        {this.totalProcs - this.wastedProcs} / {this.totalProcs} spent procs
      </>
    );
    const expiredTooltip = <>{this.expiredProcs} procs</>;
    const overcappedTooltip = <>{this.overcappedProcs} procs</>;

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
              {formatPercentage(this.utilizationPercentage, 0)} % <small>utilized</small>
            </TooltipElement>
          </div>
          <div
            style={{
              color: qualitativePerformanceToColor(this.expiredPerformance),
              fontSize: '20px',
            }}
          >
            {fingersOfFrostIcon}{' '}
            <TooltipElement content={expiredTooltip}>
              {formatPercentage(this.expiredPercent, 0)} % <small>expired</small>
            </TooltipElement>
          </div>
          <div
            style={{
              color: qualitativePerformanceToColor(this.overcappedPerformance),
              fontSize: '20px',
            }}
          >
            {fingersOfFrostIcon}{' '}
            <TooltipElement content={overcappedTooltip}>
              {formatPercentage(this.overcappedPercent, 0)} % <small>overcapped</small>
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
