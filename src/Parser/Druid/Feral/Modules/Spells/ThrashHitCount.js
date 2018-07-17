import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import HitCountAoE from '../FeralCore/HitCountAoE';

/**
 * Even with its DoT, thrash shouldn't be used against a single target. It's possible that some
 * combination of azerite traits might change this, but for now the player's resources are better
 * spent on Shred against a single target.
 */
class ThrashHitCount extends HitCountAoE {
  static spell = SPELLS.THRASH_FERAL;
  
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
          You are using <SpellLink id={SPELLS.THRASH_FERAL.id} /> out of range of any targets. Try to get familiar with the range of your area of effect abilities so you can avoid wasting energy when they'll not hit anything.
        </React.Fragment>
      )
        .icon(SPELLS.THRASH_FERAL.icon)
        .actual(`${actual.toFixed(1)} uses per minute that hit nothing.`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(11);
}

export default ThrashHitCount;
