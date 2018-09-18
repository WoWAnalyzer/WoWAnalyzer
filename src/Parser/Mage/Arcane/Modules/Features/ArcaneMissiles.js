import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import { formatPercentage, formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class ArcaneMissiles extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};

	constructor(...args) {
    super(...args);
    this.hasAnomalousImpactTrait = this.selectedCombatant.hasTrait(SPELLS.ANOMALOUS_IMPACT.id);
  }

	castWithoutClearcasting = 0;
	barrageWithProcs = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_MISSILES.id && spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		if (spellId === SPELLS.ARCANE_MISSILES.id && !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
			debug && console.log("Arcane Missiles cast without Clearcasting @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			this.castWithoutClearcasting += 1;
		} else if (spellId === SPELLS.ARCANE_BARRAGE.id && this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id,event.timestamp - 100) && this.hasAnomalousImpactTrait) {
			this.barrageWithProcs += 1;
		}
	}

	get missilesUtilization() {
		return 1 - (this.castWithoutClearcasting / this.abilityTracker.getAbility(SPELLS.ARCANE_MISSILES.id).casts);
	}

	get barrageUtilization() {
		return 1 - (this.barrageWithProcs / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts);
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
	
	get barrageSuggestionThresholds() {
    return {
      actual: this.barrageUtilization,
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
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> without <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> {this.castWithoutClearcasting} times. Arcane Missiles is a very expensive spell (more expensive than a 4 Charge Arcane Blast) and therefore it should only be cast when you have the Clearcasting buff which makes the spell free.</React.Fragment>)
					.icon(SPELLS.ARCANE_MISSILES.icon)
					.actual(`${formatPercentage(this.missilesUtilization)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
		if (this.hasAnomalousImpactTrait) {
			when(this.barrageSuggestionThresholds)
				.addSuggestion((suggest, actual, recommended) => {
					return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> without clearing your <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> Proc {this.barrageWithProcs} times. While normally this does not matter, the <SpellLink id={SPELLS.ANOMALOUS_IMPACT.id} /> Azerite Trait adds extra damage to <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> based on the number of Arcane Charges you have. Therefore, you should make sure you are clearing your Clearcasting procs before you clear your Arcane Charges.</React.Fragment>)
						.icon(SPELLS.CLEARCASTING_ARCANE.icon)
						.actual(`${formatPercentage(this.barrageUtilization)}% Uptime`)
						.recommended(`${formatPercentage(recommended)}% is recommended`);
				});
		}
	}
}

export default ArcaneMissiles;
