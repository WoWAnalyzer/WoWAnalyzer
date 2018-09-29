import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

const MANA_THRESHOLD = 0.70;

class TimeAnomaly extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};

	constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TIME_ANOMALY_TALENT.id);
	}
	
	conservedTooHigh = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		const manaPercent = event.classResources[0].amount / event.classResources[0].max;
		if (manaPercent > MANA_THRESHOLD) {
			this.conservedTooHigh += 1;
		}
	}

	get manaUtilization() {
		return 1 - (this.conservedTooHigh / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts);
	}

	get manaUtilizationThresholds() {
    return {
      actual: this.manaUtilization,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		when(this.manaUtilizationThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> with greater than 70% mana {this.conservedTooHigh} times. Because of the way <SpellLink id={SPELLS.TIME_ANOMALY_TALENT.id} /> works, you can randomly gain the <SpellLink id={SPELLS.EVOCATION.id} /> effect causing your mana to rapidly increase. If you are conserving your mana too high, this can cause your mana to cap out at 100% which is a waste. So if you are using the Time Anomaly talent, you should make sure you conserve below 70% mana to help prevent mana capping.</React.Fragment>)
					.icon(SPELLS.TIME_ANOMALY_TALENT.icon)
					.actual(`${formatPercentage(this.manaUtilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default TimeAnomaly;
