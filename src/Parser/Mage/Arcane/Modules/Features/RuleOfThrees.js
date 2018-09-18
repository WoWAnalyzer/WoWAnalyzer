import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatMilliseconds } from 'common/format';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class RuleOfThrees extends Analyzer {
	static dependencies = {
		abilityTracker: AbilityTracker,
  };

	barrageWithRuleOfThrees = 0;

	constructor(...args) {
    super(...args);
	   this.active = this.selectedCombatant.hasTalent(SPELLS.RULE_OF_THREES_TALENT.id);
  	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		if (this.selectedCombatant.hasBuff(SPELLS.RULE_OF_THREES_BUFF.id)) {
			debug && console.log("Arcane Barrage with Rule of Threes Buff @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			this.barrageWithRuleOfThrees += 1;
		}
	}

	get utilization() {
		return 1 - (this.barrageWithRuleOfThrees / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts);
	}

	get suggestionThresholds() {
    return {
      actual: this.utilization,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> {this.barrageWithRuleOfThrees} times while you had the <SpellLink id={SPELLS.RULE_OF_THREES_BUFF.id} /> buff. This buff makes your next <SpellLink id={SPELLS.ARCANE_BLAST.id} /> or <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> free after you gain your third Arcane Charge, so you should ensure that you use the buff before clearing your charges.</React.Fragment>)
					.icon(SPELLS.RULE_OF_THREES_TALENT.icon)
					.actual(`${formatPercentage(this.utilization)}% Utilization`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default RuleOfThrees;
