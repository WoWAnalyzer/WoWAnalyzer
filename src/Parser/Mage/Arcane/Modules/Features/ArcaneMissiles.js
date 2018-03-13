import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatPercentage, formatMilliseconds } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class ArcaneMissiles extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
  };

	barrageWithMissilesProc = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		if (this.combatants.selected.hasBuff(SPELLS.ARCANE_MISSILES_BUFF.id,event.timestamp - 100)) {
			debug && console.log("Arcane Barrage with Missiles Procs @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			this.barrageWithMissilesProc += 1;
		}
	}

	get utilization() {
		return 1 - (this.barrageWithMissilesProc / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts);
	}

	get suggestionThresholds() {
    return {
      actual: this.utilization,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<Wrapper>You cast <SpellLink id={SPELLS.ARCANE_BARRAGE.id}/> {this.barrageWithMissilesProc} times while you had <SpellLink id={SPELLS.ARCANE_MISSILES.id}/> procs available. Make sure you are using all of your missiles procs before casting Arcane Barrage.</Wrapper>)
					.icon(SPELLS.ARCANE_MISSILES.icon)
					.actual(`${formatPercentage(this.utilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default ArcaneMissiles;
