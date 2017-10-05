import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DivinePurpose extends Module {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	};

	on_initialized() {
		const hasDivinePurpose = this.combatants.selected.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id);
		const hasSoulOfTheHighlord = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
		this.active = hasDivinePurpose || hasSoulOfTheHighlord;
	}

	get divinePurposeProcs(){
		return this.combatants.selected.getBuffTriggerCount(SPELLS.DIVINE_PURPOSE_BUFF.id);
	}

	statistic(){
		return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id} />}
				value={`${formatNumber(this.divinePurposeProcs)}`}
				label='Divine Purpose procs'
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}
export default DivinePurpose;