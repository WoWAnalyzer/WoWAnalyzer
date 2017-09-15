import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const RET_PALADIN_T20_2SET_MODIFIER = .2;

class Tier20_2set extends Module {
	static dependencies = {
		combatants: Combatants,
	};

	damageDone = 0;

	on_byPlayer_damage(event) {
		if(this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id)){
			if(event.ability.guid === SPELLS.BLADE_OF_JUSTICE.id){
				this.damageDone += ((event.amount || 0) + (event.absorbed || 0)) * RET_PALADIN_T20_2SET_MODIFIER;
			}
		}
	}

	item() {
		const T202SetUptime = this.combatants.selected.getBuffUptime(SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id) / this.owner.fightDuration;
		const fightLengthSec = this.owner.fightDuration / 1000;
		const dps = this.damageDone / fightLengthSec;
		return {
			id: `spell-${SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id}`,
			icon: <SpellIcon id={SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id} />,
			title: <SpellLink id={SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id} />,
			result: (
				`${formatPercentage(T202SetUptime)}% uptime / ${formatNumber(dps)}`
			),
		};
	}
}

export default Tier20_2set;