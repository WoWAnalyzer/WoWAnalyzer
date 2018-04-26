import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatMilliseconds } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class Evocation extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		spellUsable: SpellUsable,
		abilityTracker: AbilityTracker,
	};
	
	badUses = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_POWER.id) {
			return;
		}
		if (!this.spellUsable.isAvailable(SPELLS.EVOCATION.id) && this.spellUsable.cooldownRemaining(SPELLS.EVOCATION.id,event.timestamp) > 20000 ) {
			this.badUses += 1;
			debug && console.log("Arcane Power cast while Evocate is Unavailable @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			debug && console.log("Evocation Cooldown remaining: " + this.spellUsable.cooldownRemaining(SPELLS.EVOCATION.id,event.timestamp));
		}
	}

	get utilization() {
		return 1 - (this.badUses / this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts);
	}

	get suggestionThresholds() {
    return {
      actual: this.utilization,
      isLessThan: {
        minor: 1,
        average: 0.70,
        major: 0.40,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_POWER.id}/> {this.badUses} times while <SpellLink id={SPELLS.EVOCATION.id}/> was unavailable. In order to ensure that Evocate is available at the end of your burn phase, dont case Arcane Power until the cooldown on Evocate is under 20 seconds.</React.Fragment>)
					.icon(SPELLS.EVOCATION.icon)
					.actual(`${formatPercentage(this.utilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default Evocation;
