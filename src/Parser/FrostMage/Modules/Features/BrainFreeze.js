import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';

class BrainFreezeTracker extends Module {
	static dependencies = {
		combatants: Combatants,
	}

	overwrittenProcs = 0;
	totalProcs = 0;

	on_byPlayer_applybuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.BRAIN_FREEZE.id){
			return;
		}
		this.totalProcs += 1;
	}

	on_byPlayer_refreshbuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.BRAIN_FREEZE.id){
			return;
		}
		this.overwrittenProcs += 1;
		this.totalProcs +=1;
	}

	suggestions(when) {
		const missedProcsPercent = this.overwrittenProcs / this.totalProcs;
		if(this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id)) {
			when(missedProcsPercent).isGreaterThan(0)
				.addSuggestion((suggest, actual, recommended) => {
					return suggest(<span>You wasted {formatPercentage(missedProcsPercent)}% <SpellLink id={SPELLS.BRAIN_FREEZE.id}/> procs. While this is mostly acceptable when using <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id}/>, try to minimize this by only holding your Brain Freeze Proc if you have 3 or more <SpellLink id={SPELLS.ICICLES.id}/>. If you have less than 3 Icicles then use your Brian Freeze Proc Normally.</span>)
						.icon(SPELLS.BRAIN_FREEZE.icon)
						.actual(`${formatNumber(this.overwrittenProcs)} missed proc(s)`)
						.recommended(`Wasting none is recommended`)
						.regular(recommended+ 0.1).major(recommended + 0.2);
				});
		} else {
			when(missedProcsPercent).isGreaterThan(0)
				.addSuggestion((suggest, actual, recommended) => {
					return suggest(<span>You wasted {formatPercentage(missedProcsPercent)}% <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. </span>)
						.icon(SPELLS.BRAIN_FREEZE.icon)
						.actual(`${formatNumber(this.overwrittenProcs)} missed proc(s)`)
						.recommended(`Wasting none is recommended`)
						.regular(recommended+ 0.00).major(recommended + 0.05);
				});
		}
	}

	statistic() {
		return(
			<StatisticBox
				icon={<SpellIcon id={SPELLS.BRAIN_FREEZE.id} />}
				value={`${formatNumber(this.totalProcs)}`}
				label='Brain Freeze Procs'
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default BrainFreezeTracker;
