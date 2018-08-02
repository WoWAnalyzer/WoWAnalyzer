import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';

/*
* Acrid Catalyst Injector -
* Equip:  Your damaging spells that critically strike have a chance to increase your Haste, Mastery, or Critical Strike by 92 for 45 sec, stacking up to 5 times. When any stack reaches 5, all effects are consumed to grant you 2,183 of all three attributes for 12 sec.
*/


class AcridCatalystInjector extends Analyzer {
	oneStatBuff = 0
	threeStatBuff = 0

	constructor(...args) {
    super(...args);
		this.active = this.selectedCombatant.hasTrinket(ITEMS.ACRID_CATALYST_INJECTOR.id);
		if (this.active) {
			this.threeStatBuff = calculateSecondaryStatDefault(955, 2397, this.selectedCombatant.getItem(ITEMS.ACRID_CATALYST_INJECTOR.id).itemLevel);
			this.oneStatBuff = calculateSecondaryStatDefault(955, 210, this.selectedCombatant.getItem(ITEMS.ACRID_CATALYST_INJECTOR.id).itemLevel);
		}
	}

	averageStatGain(spellId) {
		const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(spellId) / this.owner.fightDuration;
		const cycleUptime = this.selectedCombatant.getBuffUptime(SPELLS.CYCLE_OF_THE_LEGION.id) / this.owner.fightDuration;

		return averageStacks * this.oneStatBuff + cycleUptime * this.threeStatBuff;
	}

	item() {
		this.averageStatGain();
		return {
			item: ITEMS.ACRID_CATALYST_INJECTOR,
			result: (
				<dfn data-tip="Stat values is the gain from each proc and the Cycle of the Legion proc averaged over the fight duration.">
					<ul>
						<li>{formatNumber(this.averageStatGain(SPELLS.BRUTALITY_OF_THE_LEGION.id))} average crit</li>
						<li>{formatNumber(this.averageStatGain(SPELLS.FERVOR_OF_THE_LEGION.id))} average haste</li>
						<li>{formatNumber(this.averageStatGain(SPELLS.MALICE_OF_THE_LEGION.id))} average mastery</li>
					</ul>
				</dfn>
			),
		};
	}
}

export default AcridCatalystInjector;
