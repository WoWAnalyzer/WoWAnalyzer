import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class Apocalypse extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  
  totalApocalypseCasts = 0;
  apocalypseWoundsPopped = 0;

  constructor(...args) {
    super(...args);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.APOCALYPSE), this.onCast);
  }

  //Logic that both counts the amount of Apocalypse cast by the player, as well as the amount of wounds popped by those apocalypse.
  onCast(event){  
		this.totalApocalypseCasts+=1;
		const target = this.enemies.getEntity(event);
		const currentTargetWounds = target && target.hasBuff(SPELLS.FESTERING_WOUND.id) ? target.getBuff(SPELLS.FESTERING_WOUND.id).stacks: 0;
		if(currentTargetWounds > 4){
			this.apocalypseWoundsPopped=this.apocalypseWoundsPopped + 4;
    } else {
			this.apocalypseWoundsPopped=this.apocalypseWoundsPopped + currentTargetWounds;
	  }
  }

  suggestions(when) {
    const averageWoundsPopped = (this.apocalypseWoundsPopped/this.totalApocalypseCasts).toFixed(1);
	//Getting 6 wounds on every Apocalypse isn't difficult and should be expected
    when(averageWoundsPopped).isLessThan(4)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.APOCALYPSE.id} /> with too few <SpellLink id={SPELLS.FESTERING_WOUND.id} /> on the target. When casting <SpellLink id={SPELLS.APOCALYPSE.id} />, make sure to have at least 4 <SpellLink id={SPELLS.FESTERING_WOUND.id} /> on the target.</span>)
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
        label="Average Wounds Popped with Apocalypse"
        tooltip={`You popped ${this.apocalypseWoundsPopped} wounds with ${this.totalApocalypseCasts} casts of Apocalypse.`}
        position={STATISTIC_ORDER.CORE(6)}
      />
    );
  }
}

export default Apocalypse;
