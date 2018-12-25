import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import FuryTracker from '../resourcetracker/FuryTracker';

/**
* Anger Of The Half Giants
* Equip: Demon Blades/Demon Blades
* Demon's Bite/Demon Blades generates an additional 1 to 14 Fury.
**/


class AngerOfTheHalfGiants extends Analyzer {
	static dependencies = {
		furyTracker: FuryTracker,
		abilityTracker: AbilityTracker,
	};

	_hasDemonBlades = false;

	constructor(...args) {
    super(...args);
		this.active = this.selectedCombatant.hasFinger(ITEMS.ANGER_OF_THE_HALF_GIANTS.id);
		if(this.active) {
			this._hasDemonBlades = this.selectedCombatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id);
		}
	}

	get dBCasts() {
		if(!this._hasDemonBlades) {
			return this.abilityTracker.getAbility(SPELLS.DEMONS_BITE.id).casts;
		}
		return this.furyTracker.getBuilderCastsBySpell(SPELLS.DEMON_BLADES_FURY.id);
	}

	get furyGenerated() {
	  return this.furyTracker.getGeneratedBySpell(SPELLS.ANGER_OF_THE_HALF_GIANTS_FURY.id);
	}

	get furyWasted() {
    return this.furyTracker.getWastedBySpell(SPELLS.ANGER_OF_THE_HALF_GIANTS_FURY.id);
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
					<>{formatNumber(this.furyGenerated / this.dBCasts)} Fury gained per <SpellLink id={builderId} icon />.</>
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
      return suggest(<>You wasted {formatNumber(this.furyWasted)} of the Fury from <ItemLink id={ITEMS.ANGER_OF_THE_HALF_GIANTS.id} icon />.</>)
        .icon(ITEMS.ANGER_OF_THE_HALF_GIANTS.icon)
        .actual(`${formatPercentage(actual)}% fury wasted`)
        .recommended(`Wasting less than ${formatPercentage(recommended)}% is recommended.`);
    });
  }
}

export default AngerOfTheHalfGiants;
