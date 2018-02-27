import React from 'react'

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

/*
* 
Equip: Blade Dance has a 10% chance to grant you Chaos Blades for 6 sec.
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
	lastBuffTimestamp = 0;

	on_initizlied() {
		this.active = this.combatants.selected.hasBack(ITEMS.CHAOS_THEORY.id);
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.CHAOS_BLADES_TALENT.id) {
			return;
		}
		this.procs
	}
}