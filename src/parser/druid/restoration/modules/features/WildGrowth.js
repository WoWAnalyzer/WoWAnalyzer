import React from 'react';
import { formatPercentage } from 'common/format';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

const MS_BUFFER = 200;
const RECOMMENDED_HIT_THRESHOLD = 5;

// TODO - dynamic suggestion threshold based on variables such as Autumn leaves
// TODO - add a check for pre WG casts (hp > 95% hp && wgHits > 4)
class WildGrowth extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  lastWgCast = 0;
  wgCounter = 0;
  wgHits = [];

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WILD_GROWTH.id) {
      return;
    }
    // We check all "recent" WG applications by the player and assume that all WGs applied within a small timeframe to be applied by the same cast.
    if(this.lastWgCast === 0) {
      this.lastWgCast = event.timestamp;
    }
    if(event.timestamp - this.lastWgCast < MS_BUFFER) {
      this.wgCounter++;
    } else {
      this.wgHits.push(this.wgCounter);
      this.lastWgCast = event.timestamp;
      this.wgCounter = 1;
    }
  }

  on_finished() {
    this.wgHits.push(this.wgCounter);
  }

  get averageEffectiveHits() {
    return (this.wgHits.reduce((a, b) => a + b, 0) / this.wgs) || 0;
  }

  get belowRecommendedCasts() {
    return this.wgHits.filter(hits => hits < RECOMMENDED_HIT_THRESHOLD).length;
  }

  get wgs() {
    return this.abilityTracker.getAbility(SPELLS.WILD_GROWTH.id).casts || 0;
  }

  get rejuvs() {
    return this.abilityTracker.getAbility(SPELLS.REJUVENATION.id).casts || 0;
  }

  get wgsPerRejuv() {
    return (this.wgs / this.rejuvs) || 0;
  }

  get percentBelowRecommendedCasts() {
    return (this.belowRecommendedCasts / this.wgs) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.wgsPerRejuv,
      isLessThan: {
        minor: 0.12,
        average: 0.08,
        major: 0.03,
      },
      style: 'percentage',
    };
  }

  get suggestionpercentBelowRecommendedCastsThresholds() {
    return {
      actual: this.percentBelowRecommendedCasts,
      isGreaterThan: {
        minor: 0.00,
        average: 0.15,
        major: 0.35,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionpercentBelowRecommendedCastsThresholds)
      .addSuggestion((suggest) => {
        return suggest(<>You sometimes cast <SpellLink id={SPELLS.WILD_GROWTH.id} /> on too few targets. <SpellLink id={SPELLS.WILD_GROWTH.id} /> is not mana efficient when hitting few targets, you should only cast it when you can hit at least {RECOMMENDED_HIT_THRESHOLD} wounded targets. Make sure you are not casting on a primary target isolated from the raid. <SpellLink id={SPELLS.WILD_GROWTH.id} /> has a maximum hit radius, the injured raiders could have been out of range. Also, you should never pre-hot with <SpellLink id={SPELLS.WILD_GROWTH.id} />.
        </>)
          .icon(SPELLS.WILD_GROWTH.icon)
          .actual(`${formatPercentage(this.percentBelowRecommendedCasts, 0)}% casts on fewer than ${RECOMMENDED_HIT_THRESHOLD} targets.`)
          .recommended(`never casting on fewer than ${RECOMMENDED_HIT_THRESHOLD} is recommended`);
      });
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your <SpellLink id={SPELLS.WILD_GROWTH.id} /> to rejuv ratio can be improved, try to cast more wild growths if possible as it is usually more efficient.</>,)
          .icon(SPELLS.WILD_GROWTH.icon)
          .actual(`${this.wgs} WGs / ${this.rejuvs} rejuvs`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WILD_GROWTH.id} />}
        value={`${this.averageEffectiveHits.toFixed(2)}`}
        label="Average Wild Growth hits"
        tooltip={
          `Your Wild Growth hit on average ${this.averageEffectiveHits.toFixed(2)} players. ${this.belowRecommendedCasts} of your cast(s) hit fewer than 5 players which is the recommended targets.`
        }
      />
    );
  }
}

export default WildGrowth;
