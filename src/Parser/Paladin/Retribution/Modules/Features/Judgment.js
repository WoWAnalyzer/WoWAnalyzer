import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Judgment extends Analyzer {
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
				return suggest(<span>You're spending Holy Power outisde of the <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> debuff. It is optimal to only spend Holy Power while the enemy is debuffed with <SpellLink id={SPELLS.JUDGMENT_CAST.id} />.</span>)
					.icon(SPELLS.JUDGMENT_DEBUFF.icon)
					.actual(`${formatNumber(this.spenderOutsideJudgment)} Holy Power spenders used outside of Judgment (${formatPercentage(actual)}%).`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`)
					.regular(recommended + 0.05).major(recommended + 0.1);
			});
	}

	statistic() {
		const buffedJudgmentPercent = 1 - (this.spenderOutsideJudgment / this.totalSpender);
		const spendersInsideJudgment = this.totalSpender - this.spenderOutsideJudgment;
		return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.JUDGMENT_DEBUFF.id} />}
				value={`${formatPercentage(buffedJudgmentPercent)}%`}
				label="Spenders inside Judgment"
				tooltip={`${spendersInsideJudgment} spenders`}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default Judgment;
