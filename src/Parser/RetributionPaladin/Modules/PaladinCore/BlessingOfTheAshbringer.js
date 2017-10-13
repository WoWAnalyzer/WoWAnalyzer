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
		const blessingOfKingsUptime = this.combatants.selected.getBuffUptime(SPELLS.GREATER_BLESSING_OF_KINGS.id) / this.owner.fightDuration;
		const blessingOfWisdomUptime = this.combatants.selected.getBuffUptime(SPELLS.GREATER_BLESSING_OF_WISDOM.id) / this.owner.fightDuration;
		//returns the lower of the two uptimes since thats what your Blessing of the Ashbringer uptime was
		return blessingOfWisdomUptime > blessingOfKingsUptime ? blessingOfKingsUptime : blessingOfWisdomUptime;
	}

	suggestions(when) {
		const blessingOfTheAshbringerUptime = this.botaUptime;
		when(blessingOfWisdomUptime).isLessThan(0.95)
			.addSuggestion((suggest, actual, reccomended) => {
				return suggest('Your ')
			})
	}
}

export default BlessingOfTheAshbringer;