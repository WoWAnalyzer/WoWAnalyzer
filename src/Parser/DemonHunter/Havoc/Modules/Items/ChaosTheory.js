import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/*
* Equip: Blade Dance has a 10% chance to grant you Chaos Blades for 6 sec.
*/

const CHAOS_THEORY = {PROC_CHANCE: .1, DURATION: 6000};
const MS_BUFFER = 100;

class ChaosTheory extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	};
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
		if(this.lastCastTimestamp && (this.lastCastTimestamp + MS_BUFFER > event.timestamp)) {
			this.procs++;
			this.lastCastTimestamp = null;
			this.lastApplybuffTimestamp = event.timestamp;
		}
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (this.lastApplybuffTimestamp + CHAOS_THEORY.DURATION > event.timestamp) {
			this.lastApplybuffTimestamp = null;
			return;
		}
		if (spellId === SPELLS.CHAOS_BLADES_DAMAGE_MH.id || spellId === SPELLS.CHAOS_BLADES_DAMAGE_OH.id) {
			this.bonusDamage += (event.amount || 0) + (event.absorbed || 0);
		}
	}

	get expectedProcs() {
		return (this.abilityTracker.getAbility(SPELLS.DEATH_SWEEP.id).casts + this.abilityTracker.getAbility(SPELLS.BLADE_DANCE.id).casts) * CHAOS_THEORY.PROC_CHANCE;
	}

	item() {
		return {
			item: ITEMS.CHAOS_THEORY,
			result: (
				<dfn data-tip={`You had ${this.procs} procs (${formatNumber(this.expectedProcs)} expected procs)`}>
					<ItemDamageDone amount={this.bonusDamage}/>
				</dfn>
			),
		};
	}
}

export default ChaosTheory;