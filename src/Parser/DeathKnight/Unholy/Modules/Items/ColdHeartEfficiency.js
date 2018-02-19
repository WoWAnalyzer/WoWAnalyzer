import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
  
const coldHeartMaxStack = 20;

class ColdHeartEfficiency extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.COLD_HEART.id);
  }

  totalColdHeartCasts = 0;
  correctColdHeartCasts = 0;
  buffColdHeart = coldHeartMaxStack; //Stacks start at 20 at start of fight
  
  unholyStrengthStart = 0;
  unholyStrengthRemaining = 0;
  
  concordanceStart = 0;
  concordanceRemaining = 0;
  
  khazgorothStart = 0;
  khazgorothRemaining = 0;
  
  timeAtMaxStacksStart = this.owner.fight.start_time;
  timeAtMaxStacks = 0;
  
  castsTooEarly = 0;
  castsTooLate = 0;


  on_byPlayer_applybuff(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.UNHOLY_STRENGTH_BUFF.id) {
      this.unholyStrengthStart = event.timestamp;
    }
	  if (spellID === SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH.id) {
		  this.concordanceStart = event.timestamp;
	  }
	  if (spellID === SPELLS.KHAZGOROTHS_SHAPING.id) {
		  this.khazgorothStart = event.timestamp;
	  }
  }
  
  on_byPlayer_refreshbuff(event) {
	  const spellID = event.ability.guid;
	  if (spellID === SPELLS.UNHOLY_STRENGTH_BUFF.id) {
        this.unholyStrengthStart = event.timestamp;
     }
	  if (spellID === SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH.id) {
		  this.concordanceStart = event.timestamp;
	  }
	  if (spellID === SPELLS.KHAZGOROTHS_SHAPING.id) {
		  this.khazgorothStart = event.timestamp;
	  }
  }
  
  on_byPlayer_removebuff(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.UNHOLY_STRENGTH_BUFF.id) {
      this.unholyStrengthStart = 0;
    }
	  if (spellID === SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH.id) {
		  this.concordanceStart = 0;
    }
  	if (spellID === SPELLS.KHAZGOROTHS_SHAPING.id) {
		  this.khazgorothStart = 0;
	  }
  }

  on_byPlayer_applybuffstack(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.COLD_HEART_BUFF.id) {
      this.buffColdHeart = event.stack;
	    if (this.buffColdHeart === coldHeartMaxStack) {
		    this.timeAtMaxStacksStart = event.timestamp;
	    }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
	
    if (spellId === SPELLS.CHAINS_OF_ICE.id) {
		  this.totalColdHeartCasts++;
      
     const unholyStrengthDuration = 15000;
     const concordanceDuration = 10000;
     const khazgorothDuration = 15000;

     const coldHeartOptimalMinStack = 14;
	
     const remainingDurationAllowed = 4000;
     const maxDurationAtMaxStacksAllowed = 4000;
	  
		  this.timeAtMaxStacks = event.timestamp - this.timeAtMaxStacksStart;

		  this.unholyStrengthRemaining = unholyStrengthDuration - (event.timestamp - this.unholyStrengthStart);
		  this.concordanceRemaining = concordanceDuration - (event.timestamp - this.concordanceStart);
		  this.khazgorothRemaining = khazgorothDuration - (event.timestamp - this.khazgorothStart);
	  
		  //This checks wether or not any of the three buffs are about to fall off within the next 4 seconds.
		  if ((this.unholyStrengthRemaining > 0 && this.unholyStrengthRemaining < remainingDurationAllowed) || (this.concordanceRemaining > 0 && this.concordanceRemaining < remainingDurationAllowed) || (this.khazgorothRemaining > 0 && this.khazgorothRemaining < remainingDurationAllowed)){
			  if (this.buffColdHeart < coldHeartMaxStack && this.buffColdHeart >= coldHeartOptimalMinStack) {
				  this.correctColdHeartCasts++;
			  }
		  }
      else if (this.buffColdHeart < coldHeartMaxStack) {
		  	this.castsTooEarly++;
		  }
      else if (this.buffColdHeart === coldHeartMaxStack && this.timeAtMaxStacks <= maxDurationAtMaxStacksAllowed) {
		  	this.correctColdHeartCasts++;
		  }
      else if(this.buffColdHeart === coldHeartMaxStack){
		  	this.castsTooLate++;
		  }
		//This is only here for double casting Cold Heart. If Cold Heart is casted again before it reaches 2 stacks, the event won't update.
		  this.buffColdHeart = 0;
    }
  }
  suggestions(when) {
    const castEfficiency = this.correctColdHeartCasts / this.totalColdHeartCasts;
    when(castEfficiency).isLessThan(0.8)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper> You are casting <SpellLink id={SPELLS.CHAINS_OF_ICE.id} /> at non optimal times. {this.castsTooLate} cast(s) were made too late and {this.castsTooEarly} cast(s) were made too early. You either want to cast <SpellLink id={SPELLS.CHAINS_OF_ICE.id} /> when at 20 stacks of <SpellLink id={SPELLS.COLD_HEART_BUFF.id} /> ASAP, or when you are above 13 stacks and any of your buffs <SpellLink id={SPELLS.UNHOLY_STRENGTH_BUFF.id}/> or <SpellLink id={SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH.id} />  or <SpellLink id={SPELLS.KHAZGOROTHS_SHAPING.id} /> are about to run out. You also don't want to hold <SpellLink id={SPELLS.CHAINS_OF_ICE.id} /> at 20 stacks for too long.</Wrapper>)
          .icon(SPELLS.CHAINS_OF_ICE.icon)
          .actual(`${formatPercentage(actual)}% of Chains of Ice were cast correctly.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.20).major(recommended - 0.40);
      });
  }
  statistic() {
    const castEfficiency = this.correctColdHeartCasts / this.totalColdHeartCasts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHAINS_OF_ICE.id} />}
        value={`${formatPercentage(castEfficiency)} %`}
        label="Cold Heart Efficiency"
        tooltip={`${this.correctColdHeartCasts} out of ${this.totalColdHeartCasts} casts of Cold Heart were made optimally.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default ColdHeartEfficiency;
