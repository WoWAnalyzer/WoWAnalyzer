import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { TIME_ANOMALY_MANA_THRESHOLD } from '../../constants';

class TimeAnomaly extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
	};
	protected abilityTracker!: AbilityTracker;

	constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TIME_ANOMALY_TALENT.id);
		this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE), this.onBarrageCast);
	}
	
	conservedTooHigh = 0;

	onBarrageCast(event: CastEvent) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		const manaResource: any = event.classResources && event.classResources.find(classResource => classResource.type === RESOURCE_TYPES.MANA.id);
		const manaPercent = manaResource.amount / manaResource.max;
		if (manaPercent > TIME_ANOMALY_MANA_THRESHOLD) {
			this.conservedTooHigh += 1;
		}
	}

	get manaUtilization() {
		return 1 - (this.conservedTooHigh / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts);
	}

	get timeAnomalyManaThresholds() {
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

	suggestions(when: any) {
		when(this.timeAnomalyManaThresholds)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>You cast <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> with greater than 70% mana {this.conservedTooHigh} times. Because of the way <SpellLink id={SPELLS.TIME_ANOMALY_TALENT.id} /> works, you can randomly gain the <SpellLink id={SPELLS.EVOCATION.id} /> effect causing your mana to rapidly increase. If you are conserving your mana too high, this can cause your mana to cap out at 100% which is a waste. So if you are using the Time Anomaly talent, you should make sure you conserve below 70% mana to help prevent mana capping.</>)
					.icon(SPELLS.TIME_ANOMALY_TALENT.icon)
					.actual(`${formatPercentage(this.manaUtilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default TimeAnomaly;
