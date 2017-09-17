import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class Tier20_4set extends Module {
	static dependencies = {
		combatants: Combatants,
	};

	holyPowerGained = 0;
	builderId = SPELLS.BLADE_OF_JUSTICE.id;

	on_byPlayer_cast(event) {
		if(this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T20_4SET_BONUS_BUFF.id) && (event.ability.guid === SPELLS.BLADE_OF_JUSTICE.id || event.ability.guid === SPELLS.DIVINE_HAMMER_TALENT.id)){
			//The Tier bonus turns our 2 HP builders into 3 HP builders
			this.holyPowerGained += 1;
		}
		if(this.combatants.selected.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id)){
			this.builderId = SPELLS.DIVINE_HAMMER_TALENT.id;
		}
	}

	


	item() {
		return {
			id: `spell-${SPELLS.RET_PALADIN_T20_4SET_BONUS_BUFF.id}`,
			icon: <SpellIcon id ={this.builderId} />,
			title: <SpellLink id={SPELLS.RET_PALADIN_T20_4SET_BONUS_BUFF.id} />,
			result : (
				`${formatNumber(this.holyPowerGained)} Holy Power gained from Tier 20 4 peice.`
			),
		};
	}
}

export default Tier20_4set;