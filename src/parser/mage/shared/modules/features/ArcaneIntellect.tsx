import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

	suggestions(when: When) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => suggest(<><SpellLink id={SPELLS.ARCANE_INTELLECT.id} /> was up for {formatPercentage(this.uptime)}% of the fight. Ensure you are casting this before the pull and recasting it every time you are ressurected.</>)
					.icon(SPELLS.ARCANE_INTELLECT.icon)
					.actual(i18n._(t('mage.shared.suggestions.arcaneIntellect.uptime')`${formatPercentage(this.uptime)}% Uptime`))
					.recommended(`${formatPercentage(recommended)}% is recommended`));
	}
}

export default ArcaneIntellect;
