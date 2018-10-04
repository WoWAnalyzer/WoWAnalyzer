import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import HitCountAoE from '../core/HitCountAoE';

/**
 * Swipe shouldn't be used against a single target, the player's resources are better spent
 * on Shred against a single target.
 */
class SwipeHitCount extends HitCountAoE {
  static spell = SPELLS.SWIPE_CAT;

  get hitNoneThresholds() {
    return {
      actual: this.hitZeroPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 0.2,
        major: 0.5,
      },
      style: 'number',
    };
  }

  get hitJustOneThresholds() {
    return {
      actual: this.hitJustOnePerMinute,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 3.0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.hitNoneThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You are using <SpellLink id={SPELLS.SWIPE_CAT.id} /> out of range of any targets. Try to get familiar with the range of your area of effect abilities so you can avoid wasting energy when they'll not hit anything.
        </React.Fragment>
      )
        .icon(SPELLS.SWIPE_CAT.icon)
        .actual(`${actual.toFixed(1)} uses per minute that hit nothing.`)
        .recommended(`${recommended} is recommended`);
    });

    when(this.hitJustOneThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You are using <SpellLink id={SPELLS.SWIPE_CAT.id} /> against a single target. If there's only one target in range you'll do more damage by using <SpellLink id={SPELLS.SHRED.id} /> instead.
        </React.Fragment>
      )
        .icon(SPELLS.SWIPE_CAT.icon)
        .actual(`${actual.toFixed(1)} uses per minute that hit just one target.`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);
}

export default SwipeHitCount;
