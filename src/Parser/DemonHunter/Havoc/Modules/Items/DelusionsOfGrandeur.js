import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatNumber, formatPercentage, formatDuration, formatMilliseconds } from 'common/format';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

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
	lastTimestamp = 0;
	halfMetaDuration = 15000

	on_initialized() {
		this.active = this.combatants.selected.hasShoulder(ITEMS.DELUSIONS_OF_GRANDEUR.id);
		this.metaCooldown = this.metaCooldown - this.unleashedDemons.traitCooldownReduction;
	}

	get cooldownReductionRatio(){
		const CDRPerMeta = this.furyTracker.cooldownReduction / this.abilityTracker.getAbility(SPELLS.METAMORPHOSIS_HAVOC.id).casts;
		return (this.metaCooldown - CDRPerMeta) / this.metaCooldown;
	}

	get metaCooldownWithShoulders(){
		return this.metaCooldown * this.cooldownReductionRatio || 1;
	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.METAMORPHOSIS_HAVOC.id) {
			return;
		}
		this.lastTimestamp = event.timestamp;
	}

	get suggestionThresholds() {
    return {                                                                      //This makes sure you are getting at least half of your meta off to make the shoulders worth it to wear
      actual: (this.owner.fightDuration / 1000 < this.metaCooldownWithShoulders && this.owner.fight.end_time - this.lastTimestamp < this.halfMetaDuration) || this.abilityTracker.getAbility(SPELLS.METAMORPHOSIS_HAVOC.id).casts < 2,
      isEqual: true,
      style: 'boolean',
    };
  }

  suggestions(when) {
  	when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>{
  		return suggest(
  			<Wrapper>The fight duration of {formatDuration(this.owner.fightDuration / 1000)} minutes was shorter than your cooldown on <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon/> ({formatDuration(this.metaCooldownWithShoulders)} minutes). <ItemLink id={ITEMS.DELUSIONS_OF_GRANDEUR.id} icon/> are only useful if you get and extra cast of <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon/>.</Wrapper>
  		)
  		.icon(ITEMS.DELUSIONS_OF_GRANDEUR.icon)
  		.staticImportance(SUGGESTION_IMPORTANCE.REGULAR);
  	});
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