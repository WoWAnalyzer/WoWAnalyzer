import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

class IceLance extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		enemies: EnemyInstances,
		abilityTracker: AbilityTracker,
	}

	iceLanceTargetID = 0;
	hadFingersProc = 0;
	nonShatteredCasts = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ICE_LANCE_CAST.id) {
			return;
		}
		this.hadFingersProc = 0;
		this.iceLanceTargetID = event.targetID;
		if (this.combatants.selected.hasBuff(SPELLS.FINGERS_OF_FROST.id)) {
			this.hadFingersProc = 1;
		}
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ICE_LANCE_DAMAGE.id || event.targetID !== this.iceLanceTargetID) {
			return;
		}
		const enemy = this.enemies.getEntity(event);
		if (!enemy.hasBuff(SPELLS.WINTERS_CHILL.id) && this.hadFingersProc === 0) {
			this.nonShatteredCasts += 1;
		}
	}

	suggestions(when) {
		const utilization = 1 - (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE_CAST.id).casts);
		const nonShatteredPercent = (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE_CAST.id).casts);
		when(utilization).isLessThan(0.9)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You casted <SpellLink id={SPELLS.ICE_LANCE_CAST.id} /> {this.nonShatteredCasts} times ({formatPercentage(nonShatteredPercent)}%) with no procs. Make sure that you are only casting Ice Lance when the target has <SpellLink id={SPELLS.WINTERS_CHILL.id} />, if you have a <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc, or if you are moving and you cant cast anything else.</span>)
					.icon(SPELLS.ICE_LANCE_CAST.icon)
					.actual(`${formatPercentage(utilization)}% missed`)
					.recommended(`${formatPercentage(recommended)}% is Recommended`)
					.regular(.9).major(.8);
			});
	}

	statistic() {
		const utilization = 1 - (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE_CAST.id).casts);
		return(
			<StatisticBox
				icon={<SpellIcon id={SPELLS.ICE_LANCE_CAST.id} />}
				value={`${formatPercentage(utilization)}%`}
				label='Ice Lance Utilization'
				tooltip={'Percentage of Ice Lance casts that were shattered by Fingers of Frost or Winter\'s Chill. You should only be casting Ice Lance with no procs if you are moving and you cant use anything else.'}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default IceLance;
