import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';

class Judgment extends Module {
	static dependencies = {
		enemies: Enemies,
		combatants: Combatants,
	};
	_hasES = false;
	totalSpender = 0;
	spenderOutsideJudgment = 0;

	on_initialized(){
		this._hasES = this.combatants.selected.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id);
	}

	on_byPlayer_cast(event){
		const enemy = this.enemies.getEntity(event);
		const spellId = event.ability.guid;

		if(!enemy) {
			return;
		}
		if(spellId === SPELLS.TEMPLARS_VERDICT.id || 
			    spellId === SPELLS.DIVINE_STORM.id ||
			    spellId === SPELLS.JUSTICARS_VENGENANCE_TALENT){
			if(!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id)){
				this.spenderOutsideJudgment++;
			}
			this.totalSpender++;
		}
	}

	on_byPlayer_damage(event){
		const enemy = this.enemies.getEntity(event);
		const spellId = event.ability.guid;

		if(!this._hasES){
			return;
		}
		if(!enemy){
			return;
		}
		if(!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id)){ 
			if(spellId === SPELLS.EXECUTION_SENTENCE_TALENT.id){
			this.spenderOutsideJudgment++;
			}
			this.totalSpender++;
		}
	}

	suggestions(when) {
		const unbuffedJudgmentPercentage = this.spenderOutsideJudgment / this.totalSpender;
		when(unbuffedJudgmentPercentage).isGreaterThan(0.05)
			.addSuggestion((suggest,actual,recommended) => {
				return suggest('You\'re spending Holy Power outisde of the Judgment debuff Window too much. Only spending while the enemy has Judgment on them is very important.')
					.icon(SPELLS.JUDGMENT_DEBUFF.icon)
					.actual(`${formatPercentage(actual)}% Holy Power spenders used outside of Judgment.`)
					.recommended(`>${formatPercentage(recommended)}% is recommened`)
					.regular(recommended + 0.05).major(recommended + 0.1);
			});
	}

	statistic() {
		const buffedJudgmentPercent = 1 - (this.spenderOutsideJudgment / this.totalSpender);
		return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.JUDGMENT_DEBUFF.id} />}
				value={`${formatPercentage(buffedJudgmentPercent)}%`}
				label='Spenders inside Judgment'
			/>
		);
	}
}

export default Judgment;