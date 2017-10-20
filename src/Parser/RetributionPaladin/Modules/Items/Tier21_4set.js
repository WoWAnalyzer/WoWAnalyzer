import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const HOLY_POWER_SPENDERS = [

]

class Tier21_4set extends Module {
	static dependencies ={
		combatants: Combatants,
	};

	holyPowerGained = 0;

	on_initialized(){
		this.active = this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T21_4SET_BONUS.id);
	}

	on_byPlayer_cast(event){
		const spellId = event.ability.guid;
		if(!this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T21_4SET_BONUS.id))
			return;
		if()
	}

	item() {
		return {
			id: `spell-${SPELLS.RET_PALADIN_T21_4SET_BONUS.id}`,
			icon: <SpellIcon id ={SPELLS.RET_PALADIN_T21_4SET_BONUS.id} />,
			title: <SpellLink id={SPELLS.RET_PALADIN_T21_4SET_BONUS.id} />,
			result : (<dfn data-tip={`
				Total Holy Power Gained: ${formatNumber(this.holyPowerGained)}`}>
				{formatNumber(this.holyPowerGained / this.owner.fightDuration * 60000)} Holy Power gained per minute.
			</dfn>
			),
		};
	}
}

export default Tier21_4set;