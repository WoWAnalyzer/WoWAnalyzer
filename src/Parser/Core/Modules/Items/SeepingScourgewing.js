import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Seeping Scourgewing -
 * Equip: Your melee attacks have a chance to deal 329773 Shadow damage to the target. If there are no other enemies within 8 yds of them, this deals an additional 52253 to 57752 damage.
 */
class SeepingScourgewing extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	damage = 0;
	totalHits = 0;
	isolatedHits = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.SEEPING_SCOURGEWING.id);
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId === SPELLS.SHADOW_STRIKE.id) {
			this.damage += event.amount + (event.absorbed || 0);
			this.totalHits += 1; // When target is isolated, it procs both Shadow Strike AND Isolated Strike
		} else if (spellId === SPELLS.ISOLATED_STRIKE.id) {
			this.damage += event.amount + (event.absorbed || 0);
			this.isolatedHits += 1;
		}
	}

	item() {
		return {
			item: ITEMS.SEEPING_SCOURGEWING,
			result: (
				<dfn data-tip={`Procced <b>${this.totalHits}</b> times, of which <b>${this.isolatedHits}</b> were on an isolated target.`}>
					{this.owner.formatItemDamageDone(this.damage)}
				</dfn>
			),
		};
	}
}

export default SeepingScourgewing;
