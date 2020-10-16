import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import { TooltipElement } from 'common/Tooltip';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import getComboPointsFromEvent from '../core/getComboPointsFromEvent';
import Snapshot from '../core/Snapshot';
import ComboPointTracker from '../combopoints/ComboPointTracker';
import { PANDEMIC_FRACTION, RIP_DURATION_1_CP, RIP_DURATION_PER_CP, RIP_MAXIMUM_EXTENDED_DURATION, SABERTOOTH_EXTEND_PER_CP } from '../../constants';

const debug = false;

const MAX_ALLOWED_DURATION_REDUCTION = 500; // in ms

/**
 * Rip's damage snapshots the effects of Tiger's Fury and Bloodtalons. It's not affected by prowl.
 * Refreshing Rip with a less powerful version before the pandemic window is a damage loss.
 *
 * Ferocious Bite with the Sabertooth talent will extend a Rip bleed, maintaining the existing snapshot from when Rip was cast.
 * Applying a fresh Rip when you could have extended by using Bite is a damage loss, unless the Rip improved the snapshot.
 * Bite extending a weak Rip when you could have applied a stronger Rip can sometimes be a damage loss. There's a lot of
 * factors in play so this analyzer doesn't attempt to detect Bites that should have been Rips.
 *
 * When Bite extends the duration of a Rip, it doesn't trigger the refreshdebuff event in the combat log.
 */

class RipSnapshot extends Snapshot {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  static spell = SPELLS.RIP;
  static debuff = SPELLS.RIP;
  static durationOfFresh = null; // varies, see getDurationOfFresh()
  static isProwlAffected = false;
  static isTigersFuryAffected = true;
  static isBloodtalonsAffected = true;

  static hasSabertooth = false;

  downgradeCount = 0;
  shouldBeBiteCount = 0;
  durationReductionCount = 0;

  /**
   * Order of processed events when player casts rip is always:
   *   cast
   *   debuffapply or debuffrefresh
   * So it's safe to store the comboLastRip on cast then use it to calculate the DoT duration in response to debuff apply/refresh.
   */
  comboLastRip = 0;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id)) {
      this.constructor.hasSabertooth = true;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RIP), this._castRip);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE), this._castFerociousBite);
  }

  _castRip(event) {
    this.comboLastRip = getComboPointsFromEvent(event);
    debug && this.log(`spend ${this.comboLastRip} combo points on Rip`);
  }

  _castFerociousBite(event) {
    if (!this.constructor.hasSabertooth) {
      // without sabertooth talent the duration doesn't get extended
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const existing = this.stateByTarget[target];
    if (!existing || existing.expireTime < event.timestamp) {
      // no existing Rip on the target so nothing to extend
      return;
    }

    // FIXME: If the ferocious bite is parried (or otherwise fails to hit) it will not extend rip, but that's not accounted for here.

    // Sabertooth extends duration depending on combo points used on Bite, but there's a limit to how far into the future Rip can be extended
    const comboPoints = getComboPointsFromEvent(event);
    const remainingTime = existing.expireTime - event.timestamp;
    const newDuration = Math.min(RIP_MAXIMUM_EXTENDED_DURATION, remainingTime + comboPoints * SABERTOOTH_EXTEND_PER_CP);
    existing.expireTime = event.timestamp + newDuration;
    existing.pandemicTime = event.timestamp + newDuration * (1.0 - PANDEMIC_FRACTION);
    debug && this.log(`${comboPoints} combo bite extended rip to ${this.owner.formatTimestamp(existing.expireTime)}`);
  }

  checkRefreshRule(stateNew) {
    const stateOld = stateNew.prev;
    if (!stateOld || stateOld.expireTime < stateNew.startTime) {
      return;
    }
    const event = stateNew.castEvent;
    if (!event) {
      debug && this.warn('RipSnapshot checking refresh rule with a state that was never assigned a cast event.');
      return;
    }

    if (this.active.constructor.hasSabertooth && stateOld.power >= stateNew.power) {
      // could have extended Rip using Bite and benefited from the Bite's damage instead of this fresh cast of Rip.
      this.shouldBeBiteCount += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      const strengthComment = (stateOld.power > stateNew.power) ? 'a stronger' : 'the same strength';
      event.meta.inefficientCastReason = `Used Rip when you could have extended using Ferocious Bite and kept ${strengthComment} snapshot.`;
    }

    if (stateOld.expireTime > (stateNew.expireTime - MAX_ALLOWED_DURATION_REDUCTION)) {
      // existing DoT would have lasted longer than the new one will, so would have been better off doing nothing at all
      const remainingOld = ((stateOld.expireTime - stateNew.startTime) / 1000).toFixed(1);
      const remainingNew = ((stateNew.expireTime - stateNew.startTime) / 1000).toFixed(1);
      this.durationReductionCount += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `There was already a Rip with ${remainingOld} seconds remaining, but this cast replaced it with one lasting ${remainingNew} seconds.`;
    }

    if (stateOld.pandemicTime <= stateNew.startTime ||
        stateOld.power <= stateNew.power) {
      return;
    }
    this.downgradeCount += 1;

    // this downgrade is relatively minor, so don't overwrite cast info from elsewhere
    if (event.meta && (event.meta.isInefficientCast || event.meta.isEnhancedCast)) {
      return;
    }
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'You refreshed with a weaker version of Rip before the pandemic window.';
  }

  getDurationOfFresh(debuffEvent) {
    return RIP_DURATION_1_CP + RIP_DURATION_PER_CP * this.comboLastRip;
  }

  get shouldBeBiteProportion() {
    return this.shouldBeBiteCount / this.castCount;
  }
  get shouldBeBiteSuggestionThresholds() {
    return {
      actual: this.shouldBeBiteProportion,
      isGreaterThan: {
        minor: 0,
        average: 0.10,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  get durationReductionThresholds() {
    return {
      actual: this.durationReductionCount / this.castCount,
      isGreaterThan: {
        minor: 0,
        average: 0.10,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  get downgradeProportion() {
    return this.downgradeCount / this.castCount;
  }
  get downgradeSuggestionThresholds() {
    return {
      actual: this.downgradeProportion,
      isGreaterThan: {
        minor: 0,
        average: 0.15,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.downgradeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Try not to refresh <SpellLink id={SPELLS.RIP.id} /> before the <TooltipElement content={`The last ${(this.constructor.durationOfFresh * PANDEMIC_FRACTION / 1000).toFixed(1)} seconds of Rip's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</TooltipElement> unless you have more powerful <TooltipElement content="Applying Rip with Tiger's Fury or Bloodtalons will boost its damage until you reapply it.">snapshot buffs</TooltipElement> than were present when it was first cast.
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(i18n._(t('druid.feral.suggestions.ripSnapshot.earlyRefresh')`${this.downgradeCount} Rip refresh${this.downgradeCount === 1 ? '' : 'es'} were early downgrades.`))
        .recommended('None is recommended'));

    when(this.shouldBeBiteSuggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          With <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> you should use <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> to extend the duration of <SpellLink id={SPELLS.RIP.id} />. Only use <SpellLink id={SPELLS.RIP.id} /> when the bleed is missing or when you can improve the <TooltipElement content="Applying Rip with Tiger's Fury or Bloodtalons will boost its damage until you reapply it. This boost is maintained when Bite extends the bleed.">snapshot.</TooltipElement>
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(i18n._(t('druid.feral.suggestions.ripSnapshot.shouldBeBite')`${this.shouldBeBiteCount} Rip cast${this.shouldBeBiteCount === 1 ? '' : 's'} could have been replaced with Bite.`))
        .recommended('None is recommended'));

    when(this.durationReductionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You sometimes replaced your <SpellLink id={SPELLS.RIP.id} /> DoT with a shorter duration version. Avoid using <SpellLink id={SPELLS.RIP.id} /> at low combo points, and especially not when there's already a <SpellLink id={SPELLS.RIP.id} /> active on the target.
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(i18n._(t('druid.feral.suggestions.ripSnapshot.reducedDuration')`Rip's duration reduced ${this.durationReductionCount} time${this.durationReductionCount === 1 ? '': 's'}.`))
        .recommended('None is recommended'));
  }

  statistic() {
    return super.generateStatistic(SPELLS.RIP.name, STATISTIC_ORDER.CORE(11));
  }
}
export default RipSnapshot;
