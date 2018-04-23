import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import FuryTracker from '../ResourceTracker/FuryTracker';

/**
* Anger Of The Half Giants
* Equip: Demon Blades/Demon Blades
* Demon's Bite/Demon Blades generates an additional 1 to 14 Fury.
**/


class AngerOfTheHalfGiants extends Analyzer {
	static dependencies = {
		furyTracker: FuryTracker,
		abilityTracker: AbilityTracker,
		combatants: Combatants,
	};

	_hasDemonBlades = false;

	on_initialized() {
		this.active = this.combatants.selected.hasFinger(ITEMS.ANGER_OF_THE_HALF_GIANTS.id);
		if(this.active) {
			this._hasDemonBlades = this.combatants.selected.hasTalent(SPELLS.DEMON_BLADES_TALENT.id);
		}
	}

	get angerFury() {
		return this.furyTracker.buildersObj[SPELLS.ANGER_OF_THE_HALF_GIANTS_FURY.id];
	}

	get dBCasts() {
		if(!this._hasDemonBlades) {
			return this.abilityTracker.getAbility(SPELLS.DEMONS_BITE.id).casts;
		}
		if(this.furyTracker.buildersObj[SPELLS.DEMON_BLADES_FURY.id]) {
			return this.furyTracker.buildersObj[SPELLS.DEMON_BLADES_FURY.id].casts;
		}
		return 0;
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
		const builderId = this._hasDemonBlades ? SPELLS.DEMON_BLADES_TALENT.id : SPELLS.DEMONS_BITE.id;
		return {
			item: ITEMS.ANGER_OF_THE_HALF_GIANTS,
			result: (
				<dfn data-tip={`Total Fury Gained: <b>${formatNumber(this.furyGenerated)}</b>.`}>
					<React.Fragment>{formatNumber(this.furyGenerated / this.dBCasts)} Fury gained per <SpellLink id={builderId} icon/>.</React.Fragment>
				</dfn>
			),
		};
	}

	get suggestionThresholds() {
    return {
      actual: this.furyWasted / this.totalFury,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.08,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You wasted {formatNumber(this.furyWasted)} of the Fury from <ItemLink id={ITEMS.ANGER_OF_THE_HALF_GIANTS.id} icon/>.</React.Fragment>)
        .icon(ITEMS.ANGER_OF_THE_HALF_GIANTS.icon)
        .actual(`${formatPercentage(actual)}% fury wasted`)
        .recommended(`Wasting less than ${formatPercentage(recommended)}% is recommended.`);
    });
  }
}

export default AngerOfTheHalfGiants;
