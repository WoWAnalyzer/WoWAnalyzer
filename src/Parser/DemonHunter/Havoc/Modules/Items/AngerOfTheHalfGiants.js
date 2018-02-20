import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import FuryTracker from '../ResourceTracker/FuryTracker';

class AngerOfTheHalfGiants extends Analyzer {
	static dependencies = {
		furyTracker: FuryTracker,
		abilityTracker: AbilityTracker,
		combatants: Combatants,
	};

	_hasDemonBlades = false;

	on_initizlied() {
		this.active = this.combatants.selected.hasFinger(ITEMS.ANGER_OF_THE_HALF_GIANTS.id);
		if(this.active) {
			this._hasDemonBlades = this.combatants.selected.hasTalent(SPELLS.DEMON_BLADES.id);
		}
	}

	get angerFury() {
		return this.furyTracker.buildersObj[SPELLS.ANGER_OF_THE_HALF_GIANTS_FURY.id];
	}

	get dBCasts() {
		if(!this._hasDemonBlades) {
			return this.abilityTracker.getAbility(SPELLS.DEMONS_BITE.id).casts;
		}
		return this.furyTracker.buildersObj[SPELLS.DEMON_BLADES_FURY.id].casts;
	}

	get furyGenerated() {
		if(this.angerFury){
			return this.angerFury.generated;
		}
		return 0;
	}

	get furyWasted() {
		if(this.angerFury){
			return this.angerFury.wasted;
		}
		return 0;
	}

	get totalFury() {
		return this.furyGenerated + this.furyWasted;
	}

	item() {
		const builderId = this._hasDemonBlades ? SPELLS.DEMON_BLADES.id : SPELLS.DEMONS_BITE.id;
		return {
			item: ITEMS.ANGER_OF_THE_HALF_GIANTS,
			result: (
				<dfn data-tip={`Total Fury Gained: <b>${formatNumber(this.totalFury)}</b>.`}>
					<Wrapper>{formatNumber(this.totalFury / this.dBCasts)} Fury gained per <SpellLink id={builderId} icon/>.</Wrapper>
				</dfn>
			),
		};
	}

	get suggestionThresholds() {
    return {
      actual: this.furyWasted / this.totalFury,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You wasted {formatPercentage(actual)}% of the fury from <ItemLink id={ITEMS.ANGER_OF_THE_HALF_GIANTS.id} icon/>. Consider using an easier legendary.</Wrapper>)
        .icon(ITEMS.ANGER_OF_THE_HALF_GIANTS.icon)
        .actual(`${this.furyWasted} Fury wasted`)
        .recommended(`Wasting less than ${formatPercentage(recommended)}% is recommended.`);
    });
  }
}

export default AngerOfTheHalfGiants;
