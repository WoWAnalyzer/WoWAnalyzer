import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

const debug = false;

class ArcaneMissiles extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};

	castWithoutClearcasting = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_MISSILES.id && spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		if (spellId === SPELLS.ARCANE_MISSILES.id && !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
			debug && this.log('Arcane Missiles cast without Clearcasting');
			this.castWithoutClearcasting += 1;
		} 
	}

	get missilesUtilization() {
		return 1 - (this.castWithoutClearcasting / this.abilityTracker.getAbility(SPELLS.ARCANE_MISSILES.id).casts);
	}

	get missilesSuggestionThresholds() {
    return {
      actual: this.missilesUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.90,
      },
      style: 'percentage',
    };
	}
	
	suggestions(when) {
		when(this.missilesSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<>You cast <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> without <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> {this.castWithoutClearcasting} times. Arcane Missiles is a very expensive spell (more expensive than a 4 Charge Arcane Blast) and therefore it should only be cast when you have the Clearcasting buff which makes the spell free.</>)
					.icon(SPELLS.ARCANE_MISSILES.icon)
					.actual(`${formatPercentage(this.missilesUtilization)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default ArcaneMissiles;
