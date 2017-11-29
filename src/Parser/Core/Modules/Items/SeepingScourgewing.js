import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class SeepingScourgewing extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	bonusDmg = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.SEEPING_SCOURGEWING.id);
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId === SPELLS.SHADOW_STRIKE.id || spellId === SPELLS.ISOLATED_STRIKE.id){
			this.bonusDmg += event.amount;
		}
	}

	item() {
		return {
			item: ITEMS.SEEPING_SCOURGEWING,
			result: (
				<dfn data-tip={`The effective damage contributed by Seeping Scourgewing.<br/>
					Damage: ${this.owner.formatItemDamageDone(this.bonusDmg)}<br/>
					Total Damage: ${formatNumber(this.bonusDmg)}`}
				>
					{this.owner.formatItemDamageDone(this.bonusDmg)}
				</dfn>
			),
		};
	}
}

export default SeepingScourgewing;