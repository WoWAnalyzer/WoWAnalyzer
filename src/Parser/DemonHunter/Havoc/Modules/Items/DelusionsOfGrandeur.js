import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
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

	get percentCDRWasted(){
		return this.furyTracker.cooldownReductionWasted / this.furyTracker.cooldownReduction;
	}

	get suggestionThresholds() {
    return {
      actual: this.percentCDRWasted,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
  	when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
  		return suggest(<Wrapper>You wasted {formatPercentage(actual)}% of the cooldown reduction from <ItemLink id={ITEMS.DELUSIONS_OF_GRANDEUR.id} icon/>. Make sure to be using <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon/> on cooldown with this item.</Wrapper>)
  			.icon(ITEMS.DELUSIONS_OF_GRANDEUR.icon)
  			.actual(`${formatNumber(this.furyTracker.cooldownReductionWasted)} seconds wasted`)
  			.recommended(`Wasting less than ${formatPercentage(recommended)}% is recommended.`);
  	});
  }

	item() {
		return {
			item: ITEMS.DELUSIONS_OF_GRANDEUR,
			result:(
				<dfn data-tip={`You wasted ${formatNumber(this.furyTracker.cooldownReductionWasted)} second of cooldown reduction.`}>
					<Wrapper>Reduced the cooldown of <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} icon/> by a total of {formatNumber(this.furyTracker.cooldownReduction)} seconds.</Wrapper>
				</dfn>
			),
		};
	}
}
export default DelusionsOfGrandeur;