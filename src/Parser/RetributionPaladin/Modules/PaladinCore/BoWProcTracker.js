import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';

class BoWProcTracker extends Module {

	overwrittenBoWProcs = 0;
	totalBoWProcs = 0;

	static dependencies = {
		combatants: Combatants,
	}

	on_initialized(){
		this.active = this.combatants.selected.hasTalent(SPELLS.BLADE_OF_WRATH_TALENT.id);
	}
	
	on_byPlayer_applybuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.BLADE_OF_WRATH_PROC.id){
			return;
		}
		this.totalBoWProcs++;
	}

	on_byPlayer_refreshbuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.BLADE_OF_WRATH_PROC.id){
			return;
		}
		this.overwrittenBoWProcs++;
		this.totalBoWProcs++;
	}

	suggestions(when) {
		const missedProcsPercent = this.overwrittenBoWProcs / this.totalBoWProcs;
		when(missedProcsPercent).isGreaterThan(0)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You wasted {formatPercentage(missedProcsPercent)}% <SpellLink id={SPELLS.BLADE_OF_WRATH_PROC.id} /> procs</span>)
					.icon(SPELLS.BLADE_OF_WRATH_PROC.icon)
					.actual(`${formatNumber(this.overwrittenBoWProcs)} missed procs`)
					.recommended(`Wasting ${formatPercentage(recommended)}% is recommended`)
					.regular(recommended+ 0.05).major(recommended + 0.1);
			});
	}
}

export default BoWProcTracker;