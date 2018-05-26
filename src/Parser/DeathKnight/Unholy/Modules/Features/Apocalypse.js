import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Apocalypse extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  
  totalApocalypseCasts = 0;
  apocalypseWoundsPopped = 0;

  //Logic that both counts the amount of Apocalypse cast by the player, as well as the amount of wounds popped by those apocalypse.
  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.APOCALYPSE.id){
		this.totalApocalypseCasts+=1;
		const target = this.enemies.getEntity(event);
		const currentTargetWounds = target && target.hasBuff(SPELLS.FESTERING_WOUND.id) ? target.getBuff(SPELLS.FESTERING_WOUND.id).stacks: 0;
		if(currentTargetWounds > 5){
			this.apocalypseWoundsPopped=this.apocalypseWoundsPopped + 6;
			} else {
			this.apocalypseWoundsPopped=this.apocalypseWoundsPopped + currentTargetWounds;
		}
	}
  }

  suggestions(when) {
    const averageWoundsPopped = (this.apocalypseWoundsPopped/this.totalApocalypseCasts).toFixed(1);
	//Getting 6 wounds on every Apocalypse isn't difficult and should be expected
    when(averageWoundsPopped).isLessThan(6)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.APOCALYPSE.id} /> with too few <SpellLink id={SPELLS.FESTERING_WOUND.id} /> on the target. When casting <SpellLink id={SPELLS.APOCALYPSE.id} />, make sure to have at least 6 <SpellLink id={SPELLS.FESTERING_WOUND.id} /> on the target.</span>)
            .icon(SPELLS.APOCALYPSE.icon)
            .actual(`An average ${(actual)} of Festering Wounds were popped by Apocalypse`)
            .recommended(`${(recommended)} is recommended`)
            .regular(recommended - 1).major(recommended - 2);
        });
  }

  statistic() {
    const averageWoundsPopped = (this.apocalypseWoundsPopped/this.totalApocalypseCasts).toFixed(1);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.APOCALYPSE.id} />}
        value={`${averageWoundsPopped}`}
        label={'Average Wounds Popped with Apocalypse'}
        tooltip={`You popped ${this.apocalypseWoundsPopped} wounds with ${this.totalApocalypseCasts} casts of Apocalypse.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Apocalypse;
