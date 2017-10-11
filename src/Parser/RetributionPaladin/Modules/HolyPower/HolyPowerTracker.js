import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

class HolyPowerTracker extends Module {
  static dependencies ={
    combatants: Combatants,
  };

  holyPowerSpent = 0;
  holyPowerWasted = 0;
  totalHolyPowerGained = 0;

  //stores amount of HP generated/spent/wasted per ability
  generatedAndWasted = {
  	[SPELLS.CRUSADER_STRIKE.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  	[SPELLS.ZEAL_TALENT.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  	[SPELLS.BLADE_OF_JUSTICE.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  	[SPELLS.DIVINE_HAMMER_3_HP.id]: {
  		generated: 0,
  		wasted: 0,
  	},
    [SPELLS.DIVINE_HAMMER_2_HP.id]: {
      generated: 0,
      wasted: 0,
    },
  	[SPELLS.WAKE_OF_ASHES_HP_GEN.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  	[SPELLS.RET_PALADIN_T19_4SET_HP_GEN.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  	[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  	[SPELLS.ARCANE_TORRENT.id]: {
  		generated: 0,
  		wasted: 0,
  	},
  };

  spent = {
  	[SPELLS.TEMPLARS_VERDICT.id]: 0,
  	[SPELLS.DIVINE_STORM.id]: 0,
  	[SPELLS.EXECUTION_SENTENCE_TALENT.id]: 0,
  	[SPELLS.JUSTICARS_VENGEANCE_TALENT.id]: 0,
  	[SPELLS.WORD_OF_GLORY_TALENT.id]: 0,
  };


  on_toPlayer_energize(event) {
  	const spellId = event.ability.guid;
  	if (!this.generatedAndWasted[spellId]) {
  		return;
  	}

  	this.generatedAndWasted[spellId].generated += (event.resourceChange || 0);
  	this.generatedAndWasted[spellId].wasted += (event.waste || 0);
  	this.holyPowerWasted += (event.waste || 0);
  	this.totalHolyPowerGained += (event.resourceChange || 0) + (event.waste || 0);
  }

  on_byPlayer_cast(event) {
  	const spellId = event.ability.guid;
  	if(this.spent[spellId] === undefined){
  		return;
  	}
  	const hpCost = event.classResources[0].cost / 10;

  	this.spent[spellId] += hpCost;
  	this.holyPowerSpent += hpCost;
  	this.currentHp -= hpCost;
  }
}

export default HolyPowerTracker;