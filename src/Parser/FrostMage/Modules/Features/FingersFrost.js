import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';

class FingersFrostTracker extends Module {

	overwrittenFingersFrostProcs = 0;
	totalFingersFrostProcs = 0;

	static dependencies = {
		combatants: Combatants,
	}

	on_initialized(){}
	
	on_byPlayer_applybuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FINGERS_OF_FROST.id){
			return;
		}
		this.totalFingersFrostProcs += 1;
	}

	on_byPlayer_refreshbuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FINGERS_OF_FROST.id){
			return;
		}
		this.overwrittenFingersFrostProcs += 1;
		this.totalFingersFrostProcs +=1;
	}

	suggestions(when) {
		const missedProcsPercent = this.overwrittenFingersFrostProcs / this.totalFingersFrostProcs;
		when(missedProcsPercent).isGreaterThan(0)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You wasted {formatPercentage(missedProcsPercent)}% <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> procs</span>)
					.icon(SPELLS.FINGERS_OF_FROST.icon)
					.actual(`${formatNumber(this.overwrittenFingersFrostProcs)} missed proc(s)`)
					.recommended(`Wasting none is recommended`)
					.regular(recommended+ 0.0).major(recommended + 0.05);	
			});
	}

	statistic() {
		return(
			<StatisticBox
				icon={<SpellIcon id={SPELLS.FINGERS_OF_FROST.id} />}
				value={`${formatNumber(this.totalFingersFrostProcs)}`}
				label='Fingers of Frost Procs'
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default FingersFrostTracker;