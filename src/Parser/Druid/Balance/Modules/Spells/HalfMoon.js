import React from 'react';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import isMoonMoon from '../Core/isMoonMoon';

class HalfMoon extends Analyzer {
  halfMoonOrder = 0;
  firstMoonTime = 0;
  firstCastTime = 0;
  firstCast = false;
  firstMoonCast = false;
  orderFound = false;

  get hmAvailableCasts() {
    const offSet = this.firstMoonTime + 15;
    const totalFromCD = ((this.owner.fightDuration / 1000) - offSet) / 15;
    const eachMoon = Math.floor(totalFromCD / 3);
    let hmAvailableCasts = eachMoon + 1;

    const extraMoons = ((totalFromCD / 3) - eachMoon) * 3;
    if (extraMoons > this.halfMoonOrder) { 
      hmAvailableCasts += 1; 
    }

    return hmAvailableCasts;
  }

  on_byPlayer_cast(event) {
    if (!this.firstCast) {
      this.firstCastTime = event.timestamp;
      this.firstCast = true;
    }

    const spellId = event.ability.guid;
    if (this.orderFound || !isMoonMoon(event)) {
      return;
    }

    if (!this.firstMoonCast) {
      this.firstMoonTime = (event.timestamp - this.firstCastTime) / 1000;
      this.firstMoonCast = true;
    }

    if (spellId !== SPELLS.HALF_MOON.id) { this.halfMoonOrder += 1; } else { this.orderFound = true; }
  }

  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;
    const hmCasted = abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts;

    const percCasted = hmCasted / this.hmAvailableCasts;

    when(percCasted).isLessThan(1)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>  Your <SpellLink id={SPELLS.HALF_MOON.id} /> cast efficiency can be improved, try keeping yourself at low Moon charges at all times; you should (almost) never be at max (3) charges.</span>)
            .icon(SPELLS.HALF_MOON.icon)
            .actual(`${Math.round(formatPercentage(actual))}% casted`)
            .recommended(`${Math.round(formatPercentage(recommended))}% Half Moon available casts is recommended`)
            .regular(recommended - 0.1).major(recommended - 0.2);
        });
  }

  statistic() {
    const abilityTracker = this.owner.modules.abilityTracker;    
    const hmCasted = abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HALF_MOON.id} />}
        value={`${hmCasted}/${this.hmAvailableCasts}`}
        label="Half Moon casts"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default HalfMoon;
