import React from 'react';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import isMoonMoon from '../Core/isMoonMoon';

class NewMoon extends Analyzer {
  newMoonOrder = 0;
  firstMoonTime = 0;
  firstCastTime = 0;
  firstCast = false;
  firstMoonCast = false;
  orderFound = false;

  get nmAvailableCasts() {
    const offSet = this.firstMoonTime + 15;
    const totalFromCD = ((this.owner.fightDuration / 1000) - offSet) / 15;
    const eachMoon = Math.floor(totalFromCD / 3);
    let nmAvailableCasts = eachMoon + 1;

    const extraMoons = ((totalFromCD / 3) - eachMoon) * 3;
    if (extraMoons > this.newMoonOrder) { 
      nmAvailableCasts += 1; 
    }

    return nmAvailableCasts;
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

    if (spellId !== SPELLS.NEW_MOON.id) { this.newMoonOrder += 1; } else { this.orderFound = true; }
  }

  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;    
    const nmCasted = abilityTracker.getAbility(SPELLS.NEW_MOON.id).casts;

    const percCasted = nmCasted / this.nmAvailableCasts;

    when(percCasted).isLessThan(1)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span> Your <SpellLink id={SPELLS.NEW_MOON.id} /> cast efficiency can be improved, try keeping yourself at low Moon charges at all times; you should (almost) never be at max (3) charges.</span>)
            .icon(SPELLS.NEW_MOON.icon)
            .actual(`${Math.round(formatPercentage(actual))}% casted`)
            .recommended(`${Math.round(formatPercentage(recommended))}% New Moon available casts is recommended`)
            .regular(recommended - 0.1).major(recommended - 0.2);
        });
  }

  /*
  statistic() {
    const abilityTracker = this.owner.modules.abilityTracker;
    const nmCasted = abilityTracker.getAbility(SPELLS.NEW_MOON.id).casts;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.NEW_MOON.id} />}
        value={`${nmCasted}/${this.nmAvailableCasts}`}
        label="New Moon casts"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6); 
  */
}

export default NewMoon;
