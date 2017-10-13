import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Module from 'Parser/Core/Module';

class BlessingOfTheAshbringer extends Module {
	static dependencies = {
		combatants: Combatants,
	};

	on_initialized() {
		this.active = this.combatants.selected.traitsBySpellId[SPELLS.BLESSING_OF_THE_ASHBRINGER.id] > 0;
	}

	//Since Blessing of the Ashbringer is not always in the WCL buffs
	//This should always return the correct uptime
	get botaUptime() {
		const blessingOfTheAshbringerUptime = this.combatants.selected.getBuffUptime(SPELLS.BLESSING_OF_THE_ASHBRINGER.id) / this.owner.fightDuration;
		const blessingOfKingsUptime = this.combatants.selected.getBuffUptime(SPELLS.GREATER_BLESSING_OF_KINGS.id) / this.owner.fightDuration;
		const blessingOfWisdomUptime = this.combatants.selected.getBuffUptime(SPELLS.GREATER_BLESSING_OF_WISDOM.id) / this.owner.fightDuration;
		//returns the lower of the two uptimes since thats what your Blessing of the Ashbringer uptime was
		if(blessingOfTheAshbringerUptime){
			return blessingOfWisdomUptime;
		}
		return (blessingOfWisdomUptime > blessingOfKingsUptime) ? blessingOfKingsUptime : blessingOfWisdomUptime
	}

	suggestions(when) {
		const blessingOfTheAshbringerUptime = this.botaUptime;
		when(blessingOfTheAshbringerUptime).isLessThan(0.95)
			.addSuggestion((suggest, actual, reccomended) => {
				return suggest(<span>Your <SpellLink id={SPELLS.BLESSING_OF_THE_ASHBRINGER.id}/> of ${formatPercentage(blessingOfTheAshbringerUptime)} is less than 95%, make sure to apply <SpellLink id={SPELLS.GREATER_BLESSING_OF_WISDOM.id} /> and <SpellLink id={SPELLS.GREATER_BLESSING_OF_KINGS.id} /></span>)
					.icon(SPELLS.BLESSING_OF_THE_ASHBRINGER.id)
					.actual(`${formatPercentage(actual)}% uptime`)
					.reccomended(`${formatPercentage(reccomended)}% is reccomended`)
					.regular(reccomended).major(reccomended - 0.05);
			});
	}
}

export default BlessingOfTheAshbringer;