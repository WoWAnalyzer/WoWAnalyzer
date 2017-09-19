import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

const ASHES_TO_DUST_MODIFIER = 0.15;

class AshesToDust extends Module {
	static dependencies = {
		combatants: Combatants,
		enemies: Enemies,
	};

	damageDone = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasShoulder(ITEMS.ASHES_TO_DUST.id);
	}

	on_byPlayer_damage(event) {
		const enemy = this.enemies.getEntity(event);
		if (!enemy) {
    		return;
		}
		else if(enemy.hasBuff(SPELLS.WAKE_OF_ASHES.id)) {
			this.damageDone += ((event.amount || 0) + (event.absorbed || 0)) * ASHES_TO_DUST_MODIFIER / (1 + ASHES_TO_DUST_MODIFIER);
		}
	}

	item() {
		return {
			item: ITEMS.ASHES_TO_DUST,
		    result: (<dfn data-tip={`
				The effective damage contributed by Whisper of the Nathrezim.<br/>
				Damage: ${this.owner.formatItemDamageDone(this.damageDone)}<br/>
				Total Damage: ${formatNumber(this.damageDone)}`}>
        		{this.owner.formatItemDamageDone(this.damageDone)}
      		</dfn>),
		};
	}
}

export default AshesToDust;