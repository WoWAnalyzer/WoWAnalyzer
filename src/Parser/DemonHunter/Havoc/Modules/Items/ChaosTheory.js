import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/*
* Equip: Blade Dance has a 10% chance to grant you Chaos Blades for 6 sec.
*/

/*
* Chaos Blades:
* Increases all damage done by 30% for 18 sec.
*
* While active, your auto attack deals 150% increased damage, and causes Chaos damage.
*/

const CHAOS_THEORY = {
	PROC_CHANCE: .1, 
	DURATION: 6000, 
};

const CHAOS_BLADES = {
	AUTO_MODIFIER: 1.5,
	DAMAGE_MODIFIER: .3,
};

const MS_BUFFER = 100;

class ChaosTheory extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	};
	damage = 0;
	procs = 0;
	bonusDamage = 0;
	lastCastTimestamp = 0;
	lastApplybuffTimestamp = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasBack(ITEMS.CHAOS_THEORY.id);
	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId === SPELLS.DEATH_SWEEP.id || spellId === SPELLS.BLADE_DANCE.id) {
			this.lastCastTimestamp = event.timestamp;
		}
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.CHAOS_BLADES_TALENT.id) {
			return;
		}
		if(this.lastCastTimestamp && (event.timestamp < this.lastCastTimestamp + MS_BUFFER)) {
			this.procs++;
			this.lastCastTimestamp = null;
			this.lastApplybuffTimestamp = event.timestamp;
		}
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if(event.targetIsFriendly) {
      return;
    }
		if(event.timestamp > this.lastApplybuffTimestamp + CHAOS_THEORY.DURATION) {
			return;
		}
		if(!this.combatants.selected.hasBuff(SPELLS.CHAOS_BLADES_TALENT.id, event.timestamp)) {
			return;
		}
		//Extra Melee Damage
		if (spellId === SPELLS.CHAOS_BLADES_DAMAGE_MH.id || spellId === SPELLS.CHAOS_BLADES_DAMAGE_OH.id) {
			this.bonusDamage += calculateEffectiveDamage(event, CHAOS_BLADES.AUTO_MODIFIER);
		}
		//All Other Damage
		else {
			this.bonusDamage += calculateEffectiveDamage(event, CHAOS_BLADES.DAMAGE_MODIFIER);
		}
		
	}

	

	get expectedProcs() {
		return (this.abilityTracker.getAbility(SPELLS.DEATH_SWEEP.id).casts + this.abilityTracker.getAbility(SPELLS.BLADE_DANCE.id).casts) * CHAOS_THEORY.PROC_CHANCE;
	}

	item() {
		return {
			item: ITEMS.CHAOS_THEORY,
			result: (
				<dfn data-tip={`You had <b>${this.procs}</b> procs (<b>${formatNumber(this.expectedProcs)}</b> expected procs)</br> Total Damage: <b>${formatNumber(this.bonusDamage)}</b>`}>
					<ItemDamageDone amount={this.bonusDamage}/>
				</dfn>
			),
		};
	}
}

export default ChaosTheory;