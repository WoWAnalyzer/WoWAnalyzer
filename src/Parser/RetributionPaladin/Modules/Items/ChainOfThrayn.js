import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const CHAIN_OF_THRAYN_INCREASE = 0.1;

class ChainOfThrayn extends Module {
	static dependencies = {
		combatants: Combatants,
	};

	damageDone = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasWaist(ITEMS.CHAIN_OF_THRAYN.id);
	}

	on_byPlayer_damage(event) {
		if(this.combatants.selected.hasBuff(SPELLS.CRUSADE_TALENT.id) || this.combatants.selected.hasBuff(SPELLS.CRUSADE_TALENT.id)){
			this.damageDone += ((event.amount || 0) + (event.absorbed || 0)) * CHAIN_OF_THRAYN_INCREASE / (1 + CHAIN_OF_THRAYN_INCREASE);
		}
	}

	item() {
		return {
			item: ITEMS.CHAIN_OF_THRAYN,
			result: (<dfn data-tip={`
				The effective damage contributed by Chain of Thrayn.<br/>
				Damage: ${this.owner.formatItemDamageDone(this.damageDone)}<br/>
				Total Damage: ${formatNumber(this.damageDone)}`}>
        		{this.owner.formatItemDamageDone(this.damageDone)}
      		</dfn>),
		};
	}
}

export default ChainOfThrayn;