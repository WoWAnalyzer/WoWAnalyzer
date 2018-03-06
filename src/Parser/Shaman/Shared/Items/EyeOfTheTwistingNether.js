import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

/*
* Equip: Damaging enemies with your Fire, Frost, or Nature abilities increases all damage you deal by 1.5% for 8 sec. Each element adds a separate application.
*/

const EYE_OF_THE_TWISTING_NETHER_MODIFIER = 0.015;

class EyeOfTheTwistingNether extends Analyzer {
	static dependencies ={
		combatants: Combatants,
	}

	damageDone = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasFinger(ITEMS.EYE_OF_THE_TWISTING_NETHER.id);
	}

	on_byPlayer_damage(event) {
		if(event.targetIsFriendly) {
      return;
    }
    const buffs = 0;
    if(this.combatants.selected.hasBuff(SPELLS.SHOCK_OF_THE_TWISTING_NETHER.id)) {
    	buffs++;
    }
    if(this.combatants.selected.hasBuff(SPELLS.CHILL_OF_THE_TWISTING_NETHER.id)) {
    	buffs++;
    }
    if(this.combatants.selected.hasBuff(SPELLS.FIRE_OF_THE_TWISTING_NETHER.id)) {
    	buffs++;
    }
    this.damageDone += calculateEffectiveDamage(event, (1 + EYE_OF_THE_TWISTING_NETHER_MODIFIER) ** buffs - 1);
	}

	item() {
		return {
			item: ITEMS.EYE_OF_THE_TWISTING_NETHER,
			result: (
				<dfn data-tip={`Total Damage: <b>${formatNumber(this.damageDone)}</b>`}>
					<ItemDamageDone amount={this.damageDone}/>
				</dfn>
			),
		};
	}
}

export default EyeOfTheTwistingNether;
