import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

const MOARG_MODIFIER = 0.25;

const MS_BUFFER = 1000;

/**
* Equip: Throw Glaive deals 25% increased damage for each enemy hit.
**/

class MoargBionicStabiliziers extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};
	rank = 0;
	bonusDamage = 0;
	lastCastTimestamp = 0;
	enemiesHit = 0;
	damagePreCalc = 0;
	modifier = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasWrists(ITEMS.MOARG_BIONIC_STABILIZERS.id);
	}

	get averageTargetsHit() {
    return this.damageHits / this.casts;
  }

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.THROW_GLAIVE_HAVOC.id) {
			return;
		}
		this.lastCastTimestamp = event.timestamp;
    this.enemiesHit = 0;
    this.damagePreCalc = 0;
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (this.lastCastTimestamp && (this.lastCastTimestamp + MS_BUFFER < event.timestamp) && this.damagePreCalc > 0) {
			this.modifier = MOARG_MODIFIER * this.enemiesHit;
			this.bonusDamage += this.damagePreCalc - (this.damagePreCalc / (1 + this.modifier));
			this.lastCastTimestamp = null;
		}
		if (spellId !== SPELLS.THROW_GLAIVE_HAVOC.id) {
			return;
		}
		if ((this.lastCastTimestamp + MS_BUFFER) > event.timestamp) {
			this.damagePreCalc += event.amount + (event.absorbed || 0);
			this.enemiesHit++;
		}
	}

	item() {
		return {
			item: ITEMS.MOARG_BIONIC_STABILIZERS,
			result: <ItemDamageDone amount={this.bonusDamage}/>,
		};
	}
}

export default MoargBionicStabiliziers;