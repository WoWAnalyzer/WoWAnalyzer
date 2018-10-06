import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import HitCountAoE from '../core/HitCountAoE';

/**
 * If the player has taken the Brutal Slash talent it should be used even if there's only one
 * target available to hit. However if it's mostly only hitting a single target then the player
 * would do more damage if they had chosen a different talent.
 */
class BrutalSlashHitCount extends HitCountAoE {
  static spell = SPELLS.BRUTAL_SLASH_TALENT;
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id);
  }

  statistic() {
    return this.generateStatistic(STATISTIC_ORDER.OPTIONAL(10));
  }

  get wrongTalentThresholds() {
    return {
      // Interested in how many targets are available so exclude any "zero hit" casts.
      actual: this.averageTargetsHitNotIncludingZeroCasts,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1.2,
      },
      style: 'number',
    };
  }

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

  suggestions(when) {
    when(this.wrongTalentThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          Your <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} /> is mostly hitting just one target. On a single target fight switching talents to <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> or <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> is likely to improve your damage.
        </React.Fragment>
      )
        .icon(SPELLS.BRUTAL_SLASH_TALENT.icon)
        .actual(`${actual.toFixed(1)} average targets hit.`)
        .recommended(`>${recommended} is recommended`);
    });
    when(this.hitNoneThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You are using <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} /> out of range of any targets. Try to get familiar with the range of your area of effect abilities so you can avoid wasting charges and energy when they'll not hit anything.
        </React.Fragment>
      )
        .icon(SPELLS.BRUTAL_SLASH_TALENT.icon)
        .actual(`${actual.toFixed(1)} uses per minute that hit nothing.`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default BrutalSlashHitCount;
