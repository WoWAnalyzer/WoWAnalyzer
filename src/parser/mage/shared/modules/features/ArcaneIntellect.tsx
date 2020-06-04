import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

class ArcaneIntellect extends Analyzer {
	get uptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_INTELLECT.id) / this.owner.fightDuration;
	}

	get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 1,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

	suggestions(when: any) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<><SpellLink id={SPELLS.ARCANE_INTELLECT.id} /> was up for {formatPercentage(this.uptime)}% of the fight. Ensure you are casting this before the pull and recasting it every time you are ressurected.</>)
					.icon(SPELLS.ARCANE_INTELLECT.icon)
					.actual(`${formatPercentage(this.uptime)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default ArcaneIntellect;
