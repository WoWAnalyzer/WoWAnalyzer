import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const CAST_BUFFER = 500;

class Crusade extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	};

	on_initialized() {
		this.active = this.combatants.selected.hasTalent(SPELLS.CRUSADE_TALENT.id);
	}

	crusadeCastTimestamp = 0;
	badFirstGlobal = 0;

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.CRUSADE_TALENT.id) {
			return;
		}
		this.crusadeCastTimestamp = event.timestamp;
	}

	on_byPlayer_applybuffstack(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.CRUSADE_TALENT.id) {
			return;
		}
		if(this.crusadeCastTimestamp && event.timestamp > this.crusadeCastTimestamp + CAST_BUFFER) {
			this.badFirstGlobal++;
		}
		this.crusadeCastTimestamp = null;
	}

	get badGlobalPercent() {
		return this.badFirstGlobal / this.abilityTracker.getAbility(SPELLS.CRUSADE_TALENT.id).casts;
	}

	get suggestionThresholds() {
		return {
			actual: this.badGlobalPercent,
			isGreaterThan: {
				minor: 0,
				average: 0.25,
				major: 0.5,
			},
			style: 'percentage',
		};
	}

	suggestions(when) {
		when(this.suggestionThresholds).addSuggestion((suggest, actual) => {
			return suggest(<Wrapper>You want to build stacks of <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon/> as quickly as possible. Make sure you are using <SpellLink id={SPELLS.TEMPLARS_VERDICT.id} icon/> or <SpellLink id={SPELLS.DIVINE_STORM.id} icon/> almost instantly after casting <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon/>.</Wrapper>)
				.icon(SPELLS.CRUSADE_TALENT.icon)
				.actual(`${formatNumber(this.badFirstGlobal)} bad first global(s)`)
				.recommended(`0 is recommended`);
		});
	}
}

export default Crusade;