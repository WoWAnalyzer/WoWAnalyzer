import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import { TooltipElement } from 'common/Tooltip';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Snapshot from '../core/Snapshot';
import { MOONFIRE_FERAL_BASE_DURATION, PANDEMIC_FRACTION } from '../../constants';

/**
 * Moonfire benefits from the damage bonus of Tiger's Fury over its whole duration, even if the
 * buff wears off in that time. It's a damage loss to refresh Moonfire before the pandemic window
 * if you don't have Tiger's Fury active when the existing DoT does have it active.
 */

class MoonfireSnapshot extends Snapshot {
  static spell = SPELLS.MOONFIRE_FERAL;
  static debuff = SPELLS.MOONFIRE_FERAL;

  static durationOfFresh = MOONFIRE_FERAL_BASE_DURATION;
  static isProwlAffected = false;
  static isTigersFuryAffected = true;

  // bloodtalons only affects melee abilities
  static isBloodtalonsAffected = false;

  downgradeCastCount = 0;

  constructor(...args) {
    super(...args);
    if (!this.selectedCombatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id)) {
      this.active = false;
    }
  }

  checkRefreshRule(stateNew) {
    const stateOld = stateNew.prev;
    if (!stateOld || stateOld.expireTime < stateNew.startTime) {
      // not a refresh, so nothing to check
      return;
    }

    if (stateNew.startTime >= stateOld.pandemicTime ||
        stateNew.power >= stateOld.power) {
      // good refresh
      return;
    }

    this.downgradeCastCount += 1;

    // this downgrade is relatively minor, so don't overwrite cast info from elsewhere
    const event = stateNew.castEvent;
    if (event.meta && (event.meta.isInefficientCast || event.meta.isEnhancedCast)) {
      return;
    }
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'You refreshed with a weaker version of Moonfire before the pandemic window.';
  }

  get downgradeProportion() {
    return this.downgradeCastCount / this.castCount;
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
          Try not to refresh <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> before the <TooltipElement content={`The last ${(this.constructor.durationOfFresh * PANDEMIC_FRACTION / 1000).toFixed(1)} seconds of Moonfire's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</TooltipElement> unless you have more powerful <TooltipElement content="Applying Moonfire with Tiger's Fury will boost its damage until you reapply it.">snapshot buffs</TooltipElement> than were present when it was first cast.
        </>,
      )
        .icon(SPELLS.MOONFIRE_FERAL.icon)
        .actual(i18n._(t('druid.feral.suggestions.moonfireSnapshot.downgrades')`${formatPercentage(actual)}% of Moonfire refreshes were early downgrades.`))
        .recommended(`${recommended}% is recommended`));
  }

  statistic() {
    return super.generateStatistic(SPELLS.MOONFIRE_FERAL.name, STATISTIC_ORDER.OPTIONAL(10));
  }
}
export default MoonfireSnapshot;
