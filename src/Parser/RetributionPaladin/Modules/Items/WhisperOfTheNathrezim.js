import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const WHISPER_OF_THE_NATHREZIM_MODIFIER = 0.15;

class WhisperOfTheNathrezim extends Module {
	static dependancies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	};


	damageDone = 0;

	on_initialized() {
		if (!this.owner.error) {
		this.active = this.combatants.selected.hasBack(ITEMS.WHISPER_OF_THE_NATHREZIM.id);
		 }
	}

	on_byPlayer_damage(event){
		//make sure they have the cloak buff and are using a spender
		if (this.combatants.selected.hasBuff(SPELLS.WHISPER_OF_THE_NATHREZIM.id) && (event.ability.type === SPELLS.TEMPLARS_VERDICT.id || event.ability.type === SPELLS.DIVINE_STORM.id)){
			//Isolate the damage contribution
			this.damageDone += (event.amount + event.aborbed) * WHISPER_OF_THE_NATHREZIM_MODIFIER / (1 + WHISPER_OF_THE_NATHREZIM_MODIFIER);
		}
	}

	item() {
		const fightLengthSec = this.owner.fightDuration / 1000;
		const dps = this.damageDone / fightLengthSec;

		return {
			item: ITEMS.WHISPER_OF_THE_NATHREZIM,
			result: (
				<span>
					{formatNumber(dps)} DPS
				</span>
			),
		};
	}
}

export default WhisperOfTheNathrezim;