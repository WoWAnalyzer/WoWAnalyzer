import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Module from 'Parser/Core/Module';

const debug = false;

class BlessingOfTheAshbringer extends Module {
	static dependencies = {
		combatants: Combatants,
	};


	//Blessing of the Ashbringer = BotA
	botaUptime = 0;
	blessingOfWisdomUptime = 0;
	blessingOfKingsUptime = 0;

	on_initialized() {
		this.active = this.combatants.selected.traitsBySpellId[SPELLS.BLESSING_OF_THE_ASHBRINGER.id] > 0;
	}


	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		const targetId = event.targetID;
		this.botaUptime = this.combatants.selected.getBuffUptime(SPELLS.BLESSING_OF_THE_ASHBRINGER_BUFF.id) / this.owner.fightDuration;
		
		if(spellId === SPELLS.GREATER_BLESSING_OF_WISDOM.id){
			this.blessingOfWisdomUptime = this.combatants.players[targetId].getBuffUptime(spellId) / this.owner.fightDuration;
			debug && console.log(this.blessingOfWisdomUptime, 'wisdom uptime');
		}
		if(spellId === SPELLS.GREATER_BLESSING_OF_KINGS.id){
			this.blessingOfKingsUptime = this.combatants.players[targetId].getBuffUptime(spellId) / this.owner.fightDuration;
			debug && console.log(this.blessingOfKingsUptime, 'kings uptime');
		}

		//If Blessing of the Ashbringer is undef/NaN set it to be 
		//the lower of the uptimes between Kings and Wisdom
		if(!this.botaUptime){
			this.botaUptime = this.blessingOfWisdomUptime > this.blessingOfKingsUptime ? this.blessingOfKingsUptime : this.blessingOfKingsUptime;
			debug && console.log(this.botaUptime, 'Blessing of the Ashbringer');
		}
	}

	suggestions(when) {
		when(this.botaUptime).isLessThan(0.95)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>Your <SpellLink id={SPELLS.BLESSING_OF_THE_ASHBRINGER.id} /> uptime is low. Make sure to apply <SpellLink id={SPELLS.GREATER_BLESSING_OF_WISDOM.id} /> and <SpellLink id={SPELLS.GREATER_BLESSING_OF_KINGS.id} /> before the fight starts.</span>)
					.icon(SPELLS.BLESSING_OF_THE_ASHBRINGER.icon)
					.actual(`${formatPercentage(this.botaUptime)}%`)
					.recommended(`${formatPercentage(recommended)}% is recommended`)
					.major(recommended);
			});
	}
}

export default BlessingOfTheAshbringer;