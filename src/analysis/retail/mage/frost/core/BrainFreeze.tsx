import { Trans } from '@lingui/macro';
import { SharedCode } from 'analysis/retail/mage/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BrainFreeze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
    sharedCode: SharedCode,
  };
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;
  protected sharedCode!: SharedCode;

  overlappedFlurries = () => {
    let casts = this.eventHistory.getEvents(EventType.Cast, {
      spell: TALENTS.FLURRY_TALENT,
    });
    casts = casts.filter((c) => {
      const enemy = this.enemies.getEntity(c);
      return enemy && enemy.hasBuff(SPELLS.WINTERS_CHILL.id);
    });
    return casts.length || 0;
  };

  get expiredProcs() {
    return (
      this.sharedCode.getExpiredProcs(SPELLS.BRAIN_FREEZE_BUFF, TALENTS.FLURRY_TALENT).length || 0
    );
  }

  get totalProcs() {
    return (
      this.eventHistory.getEvents(EventType.ApplyBuff, {
        spell: SPELLS.BRAIN_FREEZE_BUFF,
      }).length || 0
    );
  }

  get overwrittenProcs() {
    return (
      this.eventHistory.getEvents(EventType.RefreshBuff, {
        spell: SPELLS.BRAIN_FREEZE_BUFF,
      }).length || 0
    );
  }

  get wastedPercent() {
    return (this.overwrittenProcs + this.expiredProcs) / this.totalProcs || 0;
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

  get overlappedFlurryThresholds() {
    return {
      actual: this.overlappedFlurries(),
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
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> debuff on them {this.overlappedFlurries()}{' '}
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
              <li>{this.totalProcs - this.expiredProcs - this.overwrittenProcs} used</li>
              <li>{this.overwrittenProcs} overwritten</li>
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
