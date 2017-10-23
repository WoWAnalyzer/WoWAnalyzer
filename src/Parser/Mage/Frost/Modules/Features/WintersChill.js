import React from 'react';

import Module from 'Parser/Core/Module';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class WintersChillTracker extends Module {

  static dependencies = {
    enemies: EnemyInstances,
  };

  iceLanceHits = 0;
  missedCasts = 0;
  doubleIceLanceHits = 0;

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE_DAMAGE.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      this.iceLanceHits += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
	  if(event.ability.guid !== SPELLS.WINTERS_CHILL.id) {
		  return;
	  }
    this.iceLanceHits = 0;
	}

  on_byPlayer_removedebuff(event) {
    if(event.ability.guid !== SPELLS.WINTERS_CHILL.id) {
      return;
    }
    if (this.iceLanceHits === 0) {
      this.missedCasts += 1;
    } else if (this.iceLanceHits === 2) {
      this.doubleIceLanceHits += 1;
    }
  }

  suggestions(when) {
    when(this.missedCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You failed to Shatter {this.missedCasts} <SpellLink id={SPELLS.WINTERS_CHILL.id}/>.  Make sure you cast <SpellLink id={SPELLS.ICE_LANCE_CAST.id}/> after each <SpellLink id={SPELLS.FLURRY.id}/> so Ice Lance can benefit from the <SpellLink id={SPELLS.SHATTER.id}/> Bonus.</span>)
          .icon(SPELLS.ICE_LANCE_CAST.icon)
          .actual(`${formatNumber(this.missedCasts)} Winter's Chill not Shattered`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(1).major(3);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WINTERS_CHILL.id} />}
        value={formatNumber(this.missedCasts)}
        label="Winter's Chill Missed"/>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default WintersChillTracker;
