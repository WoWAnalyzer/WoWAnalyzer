import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import { formatNumber, formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const WHISPER_OF_THE_NATHREZIM_MODIFIER = .15;

class WhisperOfTheNathrezim extends Module {
	static dependencies = {
		combatants: Combatants,
	};

	damageDone = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasBack(ITEMS.WHISPER_OF_THE_NATHREZIM.id);
	}

	on_byPlayer_damage(event) {
		if (this.combatants.selected.hasBuff(SPELLS.WHISPER_OF_THE_NATHREZIM.id)){
			if(event.ability.guid === SPELLS.TEMPLARS_VERDICT_DAMAGE.id || event.ability.guid === SPELLS.DIVINE_STORM_DAMAGE.id){
				this.damageDone += ((event.amount || 0) + (event.aborbed || 0)) * WHISPER_OF_THE_NATHREZIM_MODIFIER / (1 + WHISPER_OF_THE_NATHREZIM_MODIFIER);
			}
		}
	}

	item() {
	
		const RetLeggoCloakUptime = this.combatants.selected.getBuffUptime(SPELLS.WHISPER_OF_THE_NATHREZIM.id) / this.owner.fightDuration;
		const fightLengthSec = this.owner.fightDuration / 1000;
		const dps = this.damageDone / fightLengthSec;
		return {
			id: `spell-${SPELLS.WHISPER_OF_THE_NATHREZIM.id}`,
			icon: <SpellIcon id={SPELLS.WHISPER_OF_THE_NATHREZIM.id} />,
			title: <SpellLink id={SPELLS.WHISPER_OF_THE_NATHREZIM.id} />,
			result: (
				`${formatPercentage(RetLeggoCloakUptime)}% uptime / ${formatNumber(dps)} DPS`
			),
		};
	}
}

export default WhisperOfTheNathrezim;