import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Pets from 'Parser/Core/Modules/Pets';
import { formatNumber } from 'common/format';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

/*
* Equip: Dark Transformation also empowers your Dark Arbiter/Gargoyle and Army of the Dead for 30 sec, increasing their damage by 40%.
*/

const TAKTHERITRIXS_SHOULDERPADS_MODIFIER = 0.4;

class TaktheritrixsShoulderpads extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		pets: Pets,
	};

	damageDone = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasShoulder(ITEMS.TAKTHERITRIXS_SHOULDERPADS.id);
	}

	on_byPlayerPet_damage(event) {
		if(event.targetIsFriendly) {
      return;
    }
		const pet = this.pets.getSourceEntity(event);
		if(!pet.hasBuff(SPELLS.TAKTHERITRIXS_COMMAND.id, event.timestamp)) {
			return;
		}
		this.damageDone += calculateEffectiveDamage(event, TAKTHERITRIXS_SHOULDERPADS_MODIFIER);
	}

	item() {
		return {
			item: ITEMS.TAKTHERITRIXS_SHOULDERPADS,
			result: (
				<dfn data-tip={`Total Damage: <b>${formatNumber(this.damageDone)}</b>`}>
					<ItemDamageDone amount={this.damageDone} />,
				</dfn>
			),
		};
	}
}

export default TaktheritrixsShoulderpads;