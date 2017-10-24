import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class WintersChillTracker extends Analyzer {

  static dependencies = {
    enemies: EnemyInstances,
  };

  wintersChillApplied = 0;
  iceLanceCasts = 0;

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE_DAMAGE.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      this.iceLanceCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
	  if(event.ability.guid !== SPELLS.WINTERS_CHILL.id) {
		  return;
	  }
		this.wintersChillApplied += 1;
	}

  suggestions(when) {
    const missed = this.wintersChillApplied - this.iceLanceCasts;
    when(missed).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You failed to Shatter {missed} <SpellLink id={SPELLS.WINTERS_CHILL.id}/>.  Make sure you cast <SpellLink id={SPELLS.ICE_LANCE_CAST.id}/> after each <SpellLink id={SPELLS.FLURRY.id}/> so Ice Lance can benefit from the <SpellLink id={SPELLS.SHATTER.id}/> Bonus.</span>)
          .icon(SPELLS.ICE_LANCE_CAST.icon)
          .actual(`${formatNumber(missed)} Winter's Chill not Shattered`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(recommended + 1).major(recommended + 3);
      });
  }
  statistic() {
    const missed = this.wintersChillApplied - this.iceLanceCasts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WINTERS_CHILL.id} />}
        value={formatNumber(missed)}
        label="Winter's Chill Missed" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default WintersChillTracker;
