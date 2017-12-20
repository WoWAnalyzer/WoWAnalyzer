import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';


class RpPoolingDA extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DARK_ARBITER_TALENT.id);
  }

  totalRunicPowerPooled = 0;
  totalDarkArbiterCasts = 0;
  currentRP = 0;
  maxRP = 0;
  
   on_toPlayer_energize(event){
	   this.currentRP = event.classResources[0]['amount']/10 || 0;
	   this.maxRP = event.classResources[0]['max']/10;
   }
   
  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.DARK_ARBITER_TALENT.id){
		this.totalDarkArbiterCasts++;
		this.totalRunicPowerPooled += this.currentRP;
		}
	}

  suggestions(when) {
    const averageRpPooled = (this.totalRunicPowerPooled/this.totalDarkArbiterCasts).toFixed(1);
    when(averageRpPooled).isLessThan(this.maxRP-20)
 		  .addSuggestion((suggest, actual, recommended) => {
			return suggest(<span>You are casting <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/> without enough runic power. Make sure to pool some runic power before you cast <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/>.</span>)
				.icon(SPELLS.DARK_ARBITER_TALENT.icon)
				.actual(`${averageRpPooled} of runic power were pooled on average`)
				.recommended(`>${(recommended)} is recommended`)
				.regular(recommended - 20).major(recommended - 40);
        });
  }

  statistic() {
    const averageRpPooled = (this.totalRunicPowerPooled/this.totalDarkArbiterCasts).toFixed(0);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DARK_ARBITER_TALENT.id} />}
        value={`${averageRpPooled}/${this.maxRP}`}
        label={'Average Runic Power Pooled before Dark Arbiter'}
		tooltip={`A total amount of ${this.totalRunicPowerPooled} runic power was pooled for ${this.totalDarkArbiterCasts} casts of Dark Arbiter`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default RpPoolingDA;
