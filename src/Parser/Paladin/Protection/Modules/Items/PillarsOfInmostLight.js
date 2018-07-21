import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber } from 'common/format';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/*
* Equip: Eye of Tyr deals 300% increased damage and has 25% reduced cooldown.
*/

const PILLARS_OF_INMOST_LIGHT_MODIFIER = 3;

class PillarsOfInmostLight extends Analyzer {
	damageDone = 0;

	constructor(...args) {
    super(...args);
		this.active = this.selectedCombatant.hasShoulder(ITEMS.PILLARS_OF_INMOST_LIGHT.id);
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.EYE_OF_TYR.id) {
			return;
		}
		this.damageDone += calculateEffectiveDamage(event, PILLARS_OF_INMOST_LIGHT_MODIFIER);
	}

	item() {
		return {
			item: ITEMS.PILLARS_OF_INMOST_LIGHT,
			result: (
				<dfn data-tip={`Total Damage: <b>${formatNumber(this.damageDone)}</b>`}>
					<ItemDamageDone amount={this.damageDone} />
				</dfn>
			),
		};
	}
}

export default PillarsOfInmostLight;
