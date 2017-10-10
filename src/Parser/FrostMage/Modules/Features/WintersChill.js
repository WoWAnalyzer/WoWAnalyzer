import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class WintersChillTracker extends Module {

  winterschill = 0;
  icelance = 0;

  static dependencies = {
    enemies: Enemies,
  };

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.WINTERS_CHILL.id, event.timestamp)) {
      this.icelance += 1;
    }
  }
  on_byPlayer_applydebuff(event) {
	  if(event.ability.guid !== SPELLS.WINTERS_CHILL.id) {
		  return;
	  }
		  this.winterschill += 1;
	  }

  suggestions(when) {
    const missed = this.winterschill - this.icelance;
    when(missed).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You failed to Shatter {this.missed} <SpellLink id={SPELLS.WINTERS_CHILL.id}/>.  Make sure you cast <SpellLink id={SPELLS.ICE_LANCE.id}/> after each <SpellLink id={SPELLS.FLURRY.id}/> so Ice Lance can benefit from the <SpellLink id={SPELLS.SHATTER.id}/> Bonus.</span>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(`${formatNumber(this.missed)} Winter's Chill not Shattered`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(recommended + 1).major(recommended + 3);
      });
  }
  statistic() {
    const missed = this.winterschill - this.icelance;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WINTERS_CHILL.id} />}
        value={`${formatNumber(missed)}`}
        label="Winter's Chill Missed" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default WintersChillTracker;
