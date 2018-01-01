import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import EnemyInstances, { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

const SHATTER_EFFECTS = [
	SPELLS.WINTERS_CHILL.id,
	SPELLS.FROST_NOVA.id,
	SPELLS.ICE_NOVA_TALENT.id,
	SPELLS.GLACIAL_SPIKE_DAMAGE.id,
	SPELLS.RING_OF_FROST_DAMAGE.id,
];

const CAST_BUFFER_MS = 100;

class IceLance extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		enemies: EnemyInstances,
		abilityTracker: AbilityTracker,
	}

	hadFingersProc;
	iceLanceTargetID = 0;
	nonShatteredCasts = 0;

	iceLanceCastTimestamp;
	totalFingersProcs = 0;
	overwrittenFingersProcs = 0;
	expiredFingersProcs = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ICE_LANCE.id) {
			return;
		}
		this.iceLanceCastTimestamp = event.timestamp;
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

	on_byPlayer_changebuffstack(event) {
		if (event.ability.guid !== SPELLS.FINGERS_OF_FROST.id) {
			return;
		}

		// FoF overcaps don't show as a refreshbuff, instead they are a stack lost followed immediately by a gain
		const stackChange = event.stacksGained;
		if (stackChange > 0) {
			this.totalFingersProcs += stackChange;
		} else if (this.iceLanceCastTimestamp && this.iceLanceCastTimestamp + CAST_BUFFER_MS > event.timestamp) {
			// just cast ice lance, so this stack removal probably a proc used
		} else if (event.newStacks === 0) {
			this.expiredFingersProcs += (-stackChange); // stacks zero out, must be expiration
		} else {
			this.overwrittenFingersProcs += (-stackChange); // stacks don't zero, this is an overwrite
		}
	}

	get wastedFingersProcs() {
		return this.expiredFingersProcs + this.overwrittenFingersProcs;
	}

	get usedFingersProcs() {
		return this.totalFingersProcs - this.wastedFingersProcs;
	}

	get fingersUtil() {
		return 1 - (this.wastedFingersProcs / this.totalFingersProcs) || 0;
	}

	get nonShatteredPercent() {
		return (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE.id).casts);
	}

	get fingersUtilSuggestionThresholds() {
    return {
      actual: this.fingersUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

	get nonShatteredSuggestionThresholds() {
		return {
      actual: this.nonShatteredPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
	}

	suggestions(when) {
		when(this.nonShatteredSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You cast <SpellLink id={SPELLS.ICE_LANCE.id} /> {this.nonShatteredCasts} times ({formatPercentage(this.nonShatteredPercent)}%) without <SpellLink id={SPELLS.SHATTER.id} />. Make sure that you are only casting Ice Lance when the target has <SpellLink id={SPELLS.WINTERS_CHILL.id} /> (or other Shatter effects), if you have a <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc, or if you are moving and you cant cast anything else.</span>)
					.icon(SPELLS.ICE_LANCE.icon)
					.actual(`${formatPercentage(this.nonShatteredPercent)}% missed`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
	}

	statistic() {
		const shattered = 1 - (this.nonShatteredCasts / this.abilityTracker.getAbility(SPELLS.ICE_LANCE.id).casts);
    return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.ICE_LANCE.id} />}
				value={`${formatPercentage(shattered, 0)} %`}
        label="Ice Lance Shattered"
        tooltip="This is the percentage of Ice Lance casts that were shattered. You should only be casting Ice Lance without Shatter if you are moving and you cant use anything else."
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default IceLance;
