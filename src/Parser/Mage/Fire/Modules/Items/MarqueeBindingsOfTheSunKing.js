import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

class MarqueeBindingsOfTheSunKing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  
  damage = 0;
  legendaryProcs = 0;
  overwrittenProcs = 0;
  buffedPyroblasts = 0;
  expiredProcs = 0
  
  lastBuffTimestamp;
  lastPyroCastTimestamp;
  
  on_initialized() {
  this.active = this.combatants.selected.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id);
  }

	// get total count of procs
  
    on_toPlayer_applybuff(event) {
	  if (event.ability.guid !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
	  return;
    }
  this.legendaryProcs += 1;
  }
  
   // get count of refreshes
  	on_byPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
			return;
		}
		this.overwrittenProcs += 1;
		this.legendaryProcs += 1;
	}
	
	
	// this section needs explaining:
	// from looking through logs, the order of events is buff expires -> pyroblast cast begins within ~100ms -> pyroblast hits within 4.5 seconds
	// i'm not sure this is the best way to accomplish this but it seems to work
	
	//get timestamp when buff expires
	
	on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
			return;
		}
		this.lastBuffTimestamp = this.owner.currentTimestamp;
			}
	
	// for each pyroblast, check if buff expired within the past 100ms. if so, count it as buffed by the legendary
	// additionally, set timestamp of cast to do a damage check
	// i suppose it's possible for a player to instant cast pyroblast with hot streak within 100ms of the buff ending so it checks that this isn't the case.
	
	on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.PYROBLAST.id) {
			return;
		}
    if (this.lastBuffTimestamp > this.owner.currentTimestamp - 100 && !this.combatants.selected.hasBuff(SPELLS.HOT_STREAK) ) {
			this.buffedPyroblasts += 1;
			this.lastPyroCastTimestamp = this.owner.currentTimestamp;
		}
		}

	// after being cast, pyroblast takes a few seconds to travel and hit the target.
	// allows 3 seconds for the pyroblast to hit, then resets timestamp so additional instant pyroblasts within the time limit don't count.
	// this is messy and i don't know if there's an easier way
	
	on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PYROBLAST.id) {
			return;
		}
		
	if (this.owner.currentTimestamp - 3000 < this.lastPyroCastTimestamp)	
			this.damage += event.amount + (event.absorbed || 0);
			this.lastPyroCastTimestamp = 0;
			console.log(this.damage);
		}

  item() {
	  
	  // i don't think this is the best section to put this code
	  	this.expiredProcs = (this.legendaryProcs - this.overwrittenProcs - this.buffedPyroblasts);

    return {
		
	 //	i debugged this and the console log is returning the expected damage done but the math for dps isn't working as i expect?
	 // instead it returns something within about one % of the correct number
		
      item: ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING,
	  result: <ItemDamageDone amount={this.damage} />,
    };
  }
  
	// this is wordy, improve? also: change recommended numbers
	// i couldn't find the icon for the bindings so i used pyroblast
  
    suggestions(when) {
    when(this.overwrittenProcs).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your buff from <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id} /> was overwritten {formatPercentage(this.overwrittenProcs/this.legendaryProcs)}% of the time. This happens when the buff procs from an instant cast Pyroblast during Hot Streak before it is hard cast. If possible avoid using Fire Blast or Phoenix's Flames during Heating Up while you have the Marquee Bindings of the Sun King buff active.</span>)
          .icon(SPELLS.PYROBLAST.icon)
          .actual(`${this.overwrittenProcs} overwritten buffs`)
          .recommended(`0 is recommended`)
		  .regular(recommended - 0.0).major(recommended - 0.0);
      });
	  
	  when(this.expiredProcs).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your buff from <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id} /> expired {formatPercentage(this.expiredProcs/this.legendaryProcs)}% of the time. This happens when Pyroblast isn't hard cast during the fifteen seconds the buff is up. Note that this can also happen if the buff procs shortly before the fight ends when you wouldn't have had time to use it.</span>)
          .icon(SPELLS.PYROBLAST.icon)
          .actual(`${this.expiredProcs} expired procs`)
          .recommended(`0 is recommended`)
		  .regular(recommended - 0.0).major(recommended - 0.0);
      });
  }
  
}

export default MarqueeBindingsOfTheSunKing;
