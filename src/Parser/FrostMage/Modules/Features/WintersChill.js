import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class WintersChillTracker extends Module {
  static dependencies = {
    enemies: Enemies,
  };
  totalWintersChill = 0;
  inChillIceLance= 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE_CAST.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.WINTERS_CHILL.id, event.timestamp)) {
      this.inChillIceLance += 1;
    }
  }
  on_applydebuff(event) {
	  if(event.ability.guid !== SPELLS.WINTERS_CHILL.id) {
		  return;
	  }
	  const enemy = this.enemies.getEntity(event);
	  if(enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
		  this.totalWintersChill += 1;
	  }
  }
  suggestions(when) {
    const MissedWintersChill = this.totalWintersChill - this.inChillIceLance;
    when(MissedWintersChill).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You failed to Shatter {this.MissedWintersChill} <SpellLink id={SPELLS.WINTERS_CHILL.id}/>.  Make sure you cast <SpellLink id={SPELLS.ICE_LANCE_CAST.id}/> after each <SpellLink id={SPELLS.FLURRY_CAST.id}/> so <SpellLink id={SPELLS.ICE_LANCE_CAST.id}/> can benefit from the <SpellLink id={SPELLS.SHATTER.id}/> Bonus.</span>)
          .icon(SPELLS.ICE_LANCE_CAST.icon)
          .actual(`${formatNumber(actual)} Winter's Chill not Shattered`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(recommended + 1).major(recommended + 3);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WINTERS_CHILL.id} />}
        value={`${formatNumber(this.totalWintersChill)}`}
        label="Winter's Chill Shattered" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default WintersChillTracker;
