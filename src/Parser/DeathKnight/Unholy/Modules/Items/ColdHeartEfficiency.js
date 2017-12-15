import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ColdHeartEfficiency extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.COLD_HEART.id);
  }

  totalColdHeartCasts = 0;
  correctColdHeartCasts = 0;
  buffColdHeart = 0;
  unholyStrengthStart = 0;
  unholyStrengthRemaining = 0;

  on_byPlayer_applybuff(event) {
    const spellID = event.ability.guid;
    if(spellID === SPELLS.UNHOLY_STRENGTH.id){
      this.unholyStrengthStart = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellID = event.ability.guid;
    if(spellID === SPELLS.UNHOLY_STRENGTH.id){
      this.unholyStrengthStart = 0;
    }
  }

  on_byPlayer_applybuffstack(event){
    const spellID = event.ability.guid;
    if(spellID === SPELLS.COLD_HEART_BUFF.id){
      this.buffColdHeart=event.stack;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    this.unholyStrengthRemaining = 15000-(event.timestamp - this.unholyStrengthStart)
    if (spellId === SPELLS.CHAINS_OF_ICE.id) {
       this.totalColdHeartCasts++;
    	    if  (this.unholyStrengthRemaining>0) {
		         if (this.unholyStrengthRemaining <4000) {
		            if (this.buffColdHeart < 20) {
			            if (this.buffColdHeart > 16) {
                    this.correctColdHeartCasts++;
			             }
	              }
	      	  }
         }
	    if (this.buffColdHeart === 20) {
        this.correctColdHeartCasts++;
      }
      //This is only here for double casting Cold Heart. If Cold Heart is casted again before it reaches 2 stacks, the event won't update.
      this.buffColdHeart=0;
   }

  }

  suggestions(when) {
    const castEfficiency = this.correctColdHeartCasts/this.totalColdHeartCasts;
    when(castEfficiency).isLessThan(0.8)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.CHAINS_OF_ICE.id}/> at non optimal times. You either want to cast <SpellLink id={SPELLS.CHAINS_OF_ICE.id}/> when at 20 stacks of <SpellLink id={SPELLS.COLD_HEART_BUFF.id}/> or when you are above 16 stacks and you have the buff <SpellLink id={SPELLS.UNHOLY_STRENGTH.id}/></span>)
            .icon(SPELLS.CHAINS_OF_ICE.icon)
            .actual(`${formatPercentage(actual)}% of Chains of Ice were cast correctly.`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.30).major(recommended - 0.40);
        });
  }
  statistic() {
    const castEfficiency = this.correctColdHeartCasts/this.totalColdHeartCasts;
        return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHAINS_OF_ICE.id} />}
        value={`${formatPercentage(castEfficiency)} %`}
        label={'Cold Heart Efficiency'}
        tooltip={`${this.correctColdHeartCasts} out of ${this.totalColdHeartCasts} casts of Cold Heart were made optimally.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default ColdHeartEfficiency;
