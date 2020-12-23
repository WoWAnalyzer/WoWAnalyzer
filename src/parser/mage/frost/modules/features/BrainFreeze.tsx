import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import Events, { CastEvent, ApplyBuffEvent, RemoveBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { MS_BUFFER_100 } from 'parser/mage/shared/constants';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { Trans } from '@lingui/macro';

const debug = false;

class BrainFreeze extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;
  protected enemies!: EnemyInstances;

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
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.brainFreezeApplied);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.brainFreezeRefreshed);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.brainFreezeRemoved);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLURRY), this.onFlurryCast);
  }

  brainFreezeApplied(event: ApplyBuffEvent) {
    this.totalProcs += 1;
  }

  brainFreezeRefreshed(event: RefreshBuffEvent) {
    this.totalProcs += 1;
    this.overwrittenProcs += 1;
    debug && this.debug("Brain Freeze overwritten");
  }

  brainFreezeRemoved(event: RemoveBuffEvent) {
    const previousSpell = this.eventHistory.last(1, MS_BUFFER_100, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLURRY));
    if (previousSpell.length !== 0) {
      this.usedProcs += 1;
    } else {
      this.expiredProcs += 1; // If Flurry was not the spell that was cast immediately before this, then the proc must have expired.
      debug && this.debug("Brain Freeze proc expired");
    }
  }

  onFlurryCast(event: CastEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE.id)) {
      this.flurryHardCast += 1;
    } else if (enemy && enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      this.flurryOverlapped += 1;
    }
  }

  get wastedProcs() {
    return this.overwrittenProcs + this.expiredProcs;
  }

  get wastedPercent() {
    return (this.wastedProcs / this.totalProcs) || 0;
  }

  get utilPercent() {
    return 1 - this.wastedPercent;
  }

  get brainFreezeUtilizationThresholds() {
    return {
      actual: this.utilPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // Percentages lowered from .00, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
  get brainFreezeOverwritenThresholds() {
    return {
      actual: (this.overwrittenProcs / this.totalProcs) || 0,
      isGreaterThan: {
        minor: 0.00,
        average: 0.05,
        major: 0.10,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // there's almost never an excuse to let BF expire
  get brainFreezeExpiredThresholds() {
    return {
      actual: (this.expiredProcs / this.totalProcs) || 0,
      isGreaterThan: {
        minor: 0.00,
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
    }
  }

  suggestions(when: When) {
    when(this.brainFreezeOverwritenThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You overwrote {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. You should use your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs as soon as possible and avoid letting them expire or be overwritten whenever possible. There are not any situations where it would be advantageous to hold your <SpellLink id={SPELLS.BRAIN_FREEZE.id} />.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(<Trans id="mage.frost.suggestions.brainFreeze.overwritten">{formatPercentage(actual)}% overwritten</Trans>)
          .recommended(`Overwriting none is recommended`));
    when(this.brainFreezeExpiredThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You allowed {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Make sure you are using your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(<Trans id="mage.frost.suggestions.brainFreeze.expired">{formatPercentage(actual)}% expired</Trans>)
          .recommended(`Letting none expire is recommended`));
    when(this.flurryWithoutBrainFreezeThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> {actual} times. <SpellLink id={SPELLS.FLURRY.id} /> does not debuff the target with <SpellLink id={SPELLS.WINTERS_CHILL.id} /> unless you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc, so you should never cast <SpellLink id={SPELLS.FLURRY.id} /> unless you have <SpellLink id={SPELLS.BRAIN_FREEZE.id} />.</>)
          .icon(SPELLS.FLURRY.icon)
          .actual(<Trans id="mage.frost.suggestions.brainFreeze.casts">{formatNumber(actual)} casts</Trans>)
          .recommended(`Casting none is recommended`));
    when(this.overlappedFlurryThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You used a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc via casting <SpellLink id={SPELLS.FLURRY.id} /> while the target still had the <SpellLink id={SPELLS.WINTERS_CHILL.id} /> debuff on them {this.flurryOverlapped} times. Using <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> applies 2 stacks of <SpellLink id={SPELLS.WINTERS_CHILL.id} /> to the target so you should always ensure you are spending both stacks before you use another <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc.</>)
          .icon(SPELLS.FLURRY.icon)
          .actual(<Trans id="mage.frost.suggestions.brainFreeze.casts">{formatNumber(actual)} casts</Trans>)
          .recommended(`Casting none is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={(
          <>
            You got {this.totalProcs} total procs.
            <ul>
              <li>{this.usedProcs} used</li>
              <li>{this.overwrittenProcs} overwritten</li>
              <li>{this.expiredProcs} expired</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BRAIN_FREEZE}>
          {formatPercentage(this.utilPercent, 0)}% <small>Proc utilization</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BrainFreeze;
