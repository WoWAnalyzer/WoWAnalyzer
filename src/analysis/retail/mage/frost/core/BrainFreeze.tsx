import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BrainFreeze extends Analyzer {
  brainFreezeRefreshes = 0;
  flurry: { timestamp: number; overlapped: boolean }[] = [];
  brainFreeze: { apply: ApplyBuffEvent; remove: RemoveBuffEvent | undefined; expired: boolean }[] =
    [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FLURRY_TALENT),
      this.onFlurryCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this.onBrainFreeze,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this.onBrainFreezeRefresh,
    );
  }

  onFlurryCast(event: CastEvent) {
    this.flurry.push({
      timestamp: event.timestamp,
      overlapped: this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE_BUFF.id, event.timestamp - 10),
    });
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
    return this.flurry.filter((f) => f.overlapped).length;
  }

  get expiredProcs() {
    return this.brainFreeze.filter((bf) => bf.expired).length;
  }

  get totalProcs() {
    return this.brainFreeze.length;
  }

  get wastedPercent() {
    return (this.brainFreezeRefreshes + this.expiredProcs) / this.totalProcs || 0;
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

  // Percentages lowered from .00, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
  get brainFreezeOverwritenThresholds() {
    return {
      actual: this.brainFreezeRefreshes / this.totalProcs || 0,
      isGreaterThan: {
        minor: 0.0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // there's almost never an excuse to let BF expire
  get brainFreezeExpiredThresholds() {
    return {
      actual: this.expiredProcs / this.totalProcs || 0,
      isGreaterThan: {
        minor: 0.0,
        average: 0.03,
        major: 0.06,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get overlappedFlurryThresholds() {
    return {
      actual: this.brainFreezeRefreshes,
      isGreaterThan: {
        average: 0,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.brainFreezeOverwritenThresholds).addSuggestion((suggest, actual, recommended) =>
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
        .actual(
          <Trans id="mage.frost.suggestions.brainFreeze.overwritten">
            {formatPercentage(actual)}% overwritten
          </Trans>,
        )
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
        .actual(
          <Trans id="mage.frost.suggestions.brainFreeze.expired">
            {formatPercentage(actual)}% expired
          </Trans>,
        )
        .recommended(`Letting none expire is recommended`),
    );
    when(this.overlappedFlurryThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.FLURRY_TALENT} /> and applied{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> while the target still had the{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> debuff on them {this.brainFreezeRefreshes}{' '}
          times. Casting <SpellLink spell={TALENTS.FLURRY_TALENT} /> applies 2 stacks of{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> to the target so you should always ensure you
          are spending both stacks before you cast <SpellLink spell={TALENTS.FLURRY_TALENT} /> and
          apply <SpellLink spell={SPELLS.WINTERS_CHILL} /> again.
        </>,
      )
        .icon(TALENTS.FLURRY_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.brainFreeze.casts">{formatNumber(actual)} casts</Trans>,
        )
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
}

export default BrainFreeze;
