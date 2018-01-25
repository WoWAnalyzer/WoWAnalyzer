import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Wrapper from 'common/Wrapper';
import FuryTracker from '../ResourceTracker/FuryTracker';
import UnleashedDemons from '../Traits/UnleashedDemons';

/*
* Equip: The remaining cooldown on Metamorphosis is reduced by 1 sec for every 30 Fury you spend.
*/

class DelusionsOfGrandeur extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		SpellUsable: SpellUsable,
		furyTracker: FuryTracker,
		abilityTracker: AbilityTracker,
		unleashedDemons: UnleashedDemons,
	};
	metaCooldown = 300;
	on_initialized() {
		this.active = this.combatants.selected.hasShoulder(ITEMS.DELUSIONS_OF_GRANDEUR.id);
		this.metaCooldown = this.metaCooldown - this.unleashedDemons.traitCooldownReduction;
	}

	get cooldownReductionRatio(){
		const CDRPerMeta = this.furyTracker.cooldownReduction / this.abilityTracker.getAbility(SPELLS.METAMORPHOSIS_HAVOC.id).casts;
		return (this.metaCooldown - CDRPerMeta) / this.metaCooldown;
	}

	get metaCooldownWithShoulders(){
		return this.metaCooldown * this.cooldownReductionRatio || 0;
	}

	item() {

		return {
			item: ITEMS.DELUSIONS_OF_GRANDEUR,
			result:(
				<dfn data-tip={`You had ${formatNumber(this.furyTracker.cooldownReduction)} seconds of cooldown reduction, ${formatNumber(this.furyTracker.cooldownReductionWasted)} seconds of which were wasted.`}>
					<Wrapper>
						Reduced the cooldown of <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon/> by {formatPercentage(this.cooldownReductionRatio)}% ({formatDuration(this.metaCooldown)} minutes to {formatDuration(this.metaCooldownWithShoulders)} minutes on average)
					</Wrapper>
				</dfn>
			),
		};
	}
}
export default DelusionsOfGrandeur;