import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Wrapper from 'common/Wrapper';
import FuryTracker from '../ResourceTracker/FuryTracker';

/*
* Equip: The remaining cooldown on Metamorphosis is reduced by 1 sec for every 30 Fury you spend.
*/

class DelusionsOfGrandeur extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		SpellUsable: SpellUsable,
		furyTracker: FuryTracker,
	}

	on_initialized() {
		this.active = this.combatants.selected.hasShoulder(ITEMS.DELUSIONS_OF_GRANDEUR.id);
	}

	get cooldownReductionRatio(){
		return this.furyTracker.cooldownReduction / (this.owner.fightDuration + this.furyTracker.cooldownReduction);
	}

	item() {
		return {
			item: ITEMS.DELUSIONS_OF_GRANDEUR,
			result:(
				<dfn data-tip={`You had ${formatNumber(this.furyTracker.cooldownReduction / 1000)} seconds of cooldown reduction, ${formatNumber(this.furyTracker.cooldownReductionWasted / 1000)} seconds of which were wasted.`}>
					<Wrapper>Reduced the cooldown of <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon/> by {formatPercentage(this.cooldownReductionRatio)}%</Wrapper>
				</dfn>
			),
		};
	}
}
export default DelusionsOfGrandeur;