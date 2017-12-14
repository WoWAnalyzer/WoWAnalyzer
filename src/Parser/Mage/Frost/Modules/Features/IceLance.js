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
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

const SHATTER_EFFECTS = [
	SPELLS.WINTERS_CHILL.id,
	SPELLS.FROST_NOVA.id,
	SPELLS.ICE_NOVA_TALENT.id,
	SPELLS.GLACIAL_SPIKE_DAMAGE.id,
	SPELLS.RING_OF_FROST_DAMAGE.id,
];

class IceLance extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		enemies: EnemyInstances,
		abilityTracker: AbilityTracker,
	}

	hadFingersProc;
	iceLanceTargetID = 0;
	nonShatteredCasts = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ICE_LANCE.id) {
			return;
		}
		if (event.targetID) {
			this.iceLanceTargetID = encodeTargetString(event.targetID, event.targetInstance);
		}
		this.hadFingersProc = false;
		if (this.combatants.selected.hasBuff(SPELLS.FINGERS_OF_FROST.id)) {
			this.hadFingersProc = true;
		}
	}

	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
		if (spellId !== SPELLS.ICE_LANCE_DAMAGE.id || this.iceLanceTargetID !== damageTarget) {
			return;
		}
		const enemy = this.enemies.getEntity(event);
		if (enemy && !SHATTER_EFFECTS.some(effect => enemy.hasBuff(effect, event.timestamp)) && this.hadFingersProc === false) {
			this.nonShatteredCasts += 1;
		}
	}

	suggestions(when) {
		const nonShatteredPercent = (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE.id).casts);
		when(nonShatteredPercent).isGreaterThan(0.1)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You cast <SpellLink id={SPELLS.ICE_LANCE.id} /> {this.nonShatteredCasts} times ({formatPercentage(nonShatteredPercent)}%) without <SpellLink id={SPELLS.SHATTER.id} />. Make sure that you are only casting Ice Lance when the target has <SpellLink id={SPELLS.WINTERS_CHILL.id} /> (or other Shatter effects), if you have a <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc, or if you are moving and you cant cast anything else.</span>)
					.icon(SPELLS.ICE_LANCE.icon)
					.actual(`${formatPercentage(nonShatteredPercent)}% missed`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`)
					.regular(0.1).major(0.2);
			});
	}

	statistic() {
		const shattered = 1 - (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE.id).casts);
		return(
			<StatisticBox
				icon={<SpellIcon id={SPELLS.ICE_LANCE.id} />}
				value={`${formatPercentage(shattered, 0)} %`}
				label='Ice Lance Shattered'
				tooltip={'This is the percentage of Ice Lance casts that were shattered. You should only be casting Ice Lance without Shatter if you are moving and you cant use anything else.'}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default IceLance;
