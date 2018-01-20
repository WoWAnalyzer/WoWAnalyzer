import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class BlessingOfTheAshbringer extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	on_initialized() {
		this.active = this.combatants.selected.traitsBySpellId[SPELLS.BLESSING_OF_THE_ASHBRINGER.id] > 0;
	}

	get wisdom() {
		return this.combatants.getBuffUptime(SPELLS.GREATER_BLESSING_OF_WISDOM.id) / this.owner.fightDuration;
	}

	get kings() {
		return this.combatants.getBuffUptime(SPELLS.GREATER_BLESSING_OF_KINGS.id) / this.owner.fightDuration;
	}

	get uptime() {
		const uptime = this.combatants.selected.getBuffUptime(SPELLS.BLESSING_OF_THE_ASHBRINGER_BUFF.id) / this.owner.fightDuration;
		//If Blessing of the Ashbringer is undef/NaN set it to be 
		//the lower of the uptimes between Kings and Wisdom
		if(!uptime){
			debug && console.log(this.wisdom, 'wis', this.kings, 'kings');
			return this.wisdom > this.kings ? this.kings : this.wisdom;
		}
		debug && console.log(uptime, 'Blessing of the Ashbringer');
		return uptime;
	}

	get suggestionThresholds() {
		return {
			actual: this.uptime,
			isLessThan: {
				major: .95,
			},
			style: 'percentage',
		};
	}

	suggestions(when) {
		when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
			return suggest(<Wrapper>Your <SpellLink id={SPELLS.BLESSING_OF_THE_ASHBRINGER.id} icon/> uptime is low. Make sure to apply <SpellLink id={SPELLS.GREATER_BLESSING_OF_WISDOM.id} icon/> and <SpellLink id={SPELLS.GREATER_BLESSING_OF_KINGS.id} icon/> before the fight starts.</Wrapper>)
				.icon(SPELLS.BLESSING_OF_THE_ASHBRINGER.icon)
				.actual(`${formatPercentage(this.uptime)}%`)
				.recommended(`${formatPercentage(recommended)}% is recommended`);
		});
	}
}

export default BlessingOfTheAshbringer;