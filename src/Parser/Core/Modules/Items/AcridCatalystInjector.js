import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
* Acrid Catalyst Injector -
* Equip:  Your damaging spells that critically strike have a chance to increase your Haste, Mastery, or Critical Strike by 92 for 45 sec, stacking up to 5 times. When any stack reaches 5, all effects are consumed to grant you 2,183 of all three attributes for 12 sec.
*/


class AcridCatalystInjector extends Analyzer {
	static dependencies = {
		combatants: Combatants,
	};

	oneStatBuff = 0
	threeStatBuff = 0

	totalCrit = 0
	totalHaste = 0
	totalMastery = 0

	averageCrit = 0
	averageHaste = 0
	averageMastery = 0

	on_initialized() {
		this.active = this.combatants.selected.hasTrinket(ITEMS.ACRID_CATALYST_INJECTOR.id);
		if (this.active) {
			this.threeStatBuff = calculateSecondaryStatDefault(930, 2183, this.combatants.selected.getItem(ITEMS.ACRID_CATALYST_INJECTOR.id).itemLevel);
			this.oneStatBuff = calculateSecondaryStatDefault(930, 92, this.combatants.selected.getItem(ITEMS.ACRID_CATALYST_INJECTOR.id).itemLevel);
		}
	}

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
		if(spellId === SPELLS.FERVOR_OF_THE_LEGION.id) {
			this.totalHaste += this.oneStatBuff;
		}
		if(spellId === SPELLS.BRUTALITY_OF_THE_LEGION.id) {
			this.totalCrit += this.oneStatBuff;
		}
		if(spellId === SPELLS.MALICE_OF_THE_LEGION.id){
			this.totalMastery += this.oneStatBuff;
		}
	}

	on_byPlayer_applybuffstack(event) {
		const spellId = event.ability.guid;
		if(spellId === SPELLS.FERVOR_OF_THE_LEGION.id) {
			this.totalHaste += this.oneStatBuff;
		}
		if(spellId === SPELLS.BRUTALITY_OF_THE_LEGION.id) {
			this.totalCrit += this.oneStatBuff;
		}
		if(spellId === SPELLS.MALICE_OF_THE_LEGION.id){
			this.totalMastery += this.oneStatBuff;
		}
	}

	averageStatGain() {
		const critUptime = this.combatants.selected.getBuffUptime(SPELLS.BRUTALITY_OF_THE_LEGION.id) / this.owner.fightDuration;
		const hasteUptime = this.combatants.selected.getBuffUptime(SPELLS.FERVOR_OF_THE_LEGION.id) / this.owner.fightDuration;
		const masteryUptime = this.combatants.selected.getBuffUptime(SPELLS.MALICE_OF_THE_LEGION.id) / this.owner.fightDuration;
		const cycleUptime = this.combatants.selected.getBuffUptime(SPELLS.CYCLE_OF_THE_LEGION.id) / this.owner.fightDuration;

		this.averageCrit = this.totalCrit * critUptime + this.threeStatBuff * cycleUptime;
		this.averageHaste = this.totalHaste * hasteUptime + this.threeStatBuff * cycleUptime;
		this.averageMastery = this.totalMastery * masteryUptime + this.threeStatBuff * cycleUptime;

	}

	item() {
		this.averageStatGain();
		return {
			item: ITEMS.ACRID_CATALYST_INJECTOR,
			result: (
				<dfn data-tip={`Stat values is the gain from each proc and the Cycle of the Legion proc average over the fight duration.`}>
					<ul>
						<li>{formatNumber(this.averageCrit)} average crit</li>
						<li>{formatNumber(this.averageHaste)} average haste</li>
						<li>{formatNumber(this.averageMastery)} average mastery</li>
					</ul>
				</dfn>
			),
		};
	}
}

export default AcridCatalystInjector;