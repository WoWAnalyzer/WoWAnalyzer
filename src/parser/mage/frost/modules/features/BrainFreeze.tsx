import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { PROC_BUFFER } from '../../constants';

const debug = false;

class BrainFreeze extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  usedProcs = 0;
  overwrittenProcs = 0;
  expiredProcs = 0;
  totalProcs = 0;
  flurryHardCast = 0;

  // Tracks whether the last brain freeze generator to be cast was Ebonbolt or Frostbolt
  wasLastGeneratorEB = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.brainFreezeApplied);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.brainFreezeRefreshed);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE), this.brainFreezeRemoved);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLURRY), this.onFlurryCast);
  }

  brainFreezeApplied() {
    this.totalProcs += 1;
  }

  brainFreezeRefreshed() {
    this.totalProcs += 1;
    this.overwrittenProcs += 1;
    debug && this.debug("Brain Freeze overwritten");
  }

  brainFreezeRemoved() {
    const previousSpell = this.eventHistory.last(1, PROC_BUFFER, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLURRY));
    if (previousSpell.length !== 0) {
      this.usedProcs += 1;
    } else {
      this.expiredProcs += 1; // If Flurry was not the spell that was cast immediately before this, then the proc must have expired.
      debug && this.debug("Brain Freeze proc expired");
    }
  }

  onFlurryCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE.id)) {
      this.flurryHardCast += 1;
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

  suggestions(when: When) {
    when(this.brainFreezeOverwritenThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You overwrite {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. You should use your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs as soon as possible and avoid letting them expire or be overwritten whenever possible. There are not any situations where it would be advantageous to hold your <SpellLink id={SPELLS.BRAIN_FREEZE.id} />.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(i18n._(t('mage.frost.suggestions.brainFreeze.overwritten')`${formatPercentage(actual)}% overwritten`))
          .recommended(`Overwriting none is recommended`));
    when(this.brainFreezeExpiredThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You allowed {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Make sure you are using your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(i18n._(t('mage.frost.suggestions.brainFreeze.expired')`${formatPercentage(actual)}% expired`))
          .recommended(`Letting none expire is recommended`));
    when(this.flurryWithoutBrainFreezeThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> {actual} times. <SpellLink id={SPELLS.FLURRY.id} /> does not debuff the target with <SpellLink id={SPELLS.WINTERS_CHILL.id} /> unless you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc, so you should never cast <SpellLink id={SPELLS.FLURRY.id} /> unless you have <SpellLink id={SPELLS.BRAIN_FREEZE.id} />.</>)
          .icon(SPELLS.FLURRY.icon)
          .actual(i18n._(t('mage.frost.suggestions.brainFreeze.casts')`${formatNumber(actual)} casts`))
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
