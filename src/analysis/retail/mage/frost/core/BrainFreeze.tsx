import { Trans } from '@lingui/macro';
import { MS_BUFFER_100 } from 'analysis/retail/mage/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const debug = false;

class BrainFreeze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;
  protected enemies!: Enemies;

  usedProcs = 0;
  overwrittenProcs = 0;
  expiredProcs = 0;
  totalProcs = 0;
  flurryHardCast = 0;
  flurryOverlapped = 0;

  // Tracks whether the last brain freeze generator to be cast was Ebonbolt or Frostbolt
  wasLastGeneratorEB = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.BRAIN_FREEZE_TALENT),
      this.brainFreezeApplied,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.BRAIN_FREEZE_TALENT),
      this.brainFreezeRefreshed,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.BRAIN_FREEZE_TALENT),
      this.brainFreezeRemoved,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FLURRY_TALENT),
      this.onFlurryCast,
    );
  }

  brainFreezeApplied(event: ApplyBuffEvent) {
    this.totalProcs += 1;
  }

  brainFreezeRefreshed(event: RefreshBuffEvent) {
    this.totalProcs += 1;
    this.overwrittenProcs += 1;
    debug && this.debug('Brain Freeze overwritten');
  }

  brainFreezeRemoved(event: RemoveBuffEvent) {
    const previousSpell = this.eventHistory.last(
      1,
      MS_BUFFER_100,
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FLURRY_TALENT),
    );
    if (previousSpell.length !== 0) {
      this.usedProcs += 1;
    } else {
      this.expiredProcs += 1; // If Flurry was not the spell that was cast immediately before this, then the proc must have expired.
      debug && this.debug('Brain Freeze proc expired');
    }
  }

  onFlurryCast(event: CastEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!this.selectedCombatant.hasBuff(TALENTS.BRAIN_FREEZE_TALENT.id)) {
      this.flurryHardCast += 1;
    } else if (enemy && enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      this.flurryOverlapped += 1;
    }
  }

  get wastedProcs() {
    return this.overwrittenProcs + this.expiredProcs;
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

  // Percentages lowered from .00, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
  get brainFreezeOverwritenThresholds() {
    return {
      actual: this.overwrittenProcs / this.totalProcs || 0,
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

  get flurryWithoutBrainFreezeThresholds() {
    return {
      actual: this.flurryHardCast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get overlappedFlurryThresholds() {
    return {
      actual: this.flurryOverlapped,
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
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> procs. You should use your{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> procs as soon as possible and avoid
          letting them expire or be overwritten whenever possible. There are not any situations
          where it would be advantageous to hold your{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} />.
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
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> procs to expire. Make sure you are using
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
    when(this.flurryWithoutBrainFreezeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.FLURRY_TALENT.id} /> without{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> {actual} times.{' '}
          <SpellLink id={TALENTS.FLURRY_TALENT.id} /> does not debuff the target with{' '}
          <SpellLink id={SPELLS.WINTERS_CHILL.id} /> unless you have a{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc, so you should never cast{' '}
          <SpellLink id={TALENTS.FLURRY_TALENT.id} /> unless you have{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} />.
        </>,
      )
        .icon(TALENTS.FLURRY_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.brainFreeze.casts">{formatNumber(actual)} casts</Trans>,
        )
        .recommended(`Casting none is recommended`),
    );
    when(this.overlappedFlurryThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You used a <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc via casting{' '}
          <SpellLink id={TALENTS.FLURRY_TALENT.id} /> while the target still had the{' '}
          <SpellLink id={SPELLS.WINTERS_CHILL.id} /> debuff on them {this.flurryOverlapped} times.
          Using <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> applies 2 stacks of{' '}
          <SpellLink id={SPELLS.WINTERS_CHILL.id} /> to the target so you should always ensure you
          are spending both stacks before you use another{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc.
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
              <li>{this.usedProcs} used</li>
              <li>{this.overwrittenProcs} overwritten</li>
              <li>{this.expiredProcs} expired</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.BRAIN_FREEZE_TALENT.id}>
          {formatPercentage(this.utilPercent, 0)}% <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BrainFreeze;
