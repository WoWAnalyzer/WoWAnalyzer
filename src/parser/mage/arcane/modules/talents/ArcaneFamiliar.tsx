import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatPercentage } from 'common/format';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { Trans } from '@lingui/macro';

class ArcaneFamiliar extends Analyzer {

	constructor(options: Options) {
    super(options);
      this.active = this.selectedCombatant.hasTalent(SPELLS.ARCANE_FAMILIAR_TALENT.id);
  }

	get uptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_FAMILIAR_BUFF.id) / this.owner.fightDuration;
	}

	get arcaneFamiliarUptimeThresholds() {
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
		when(this.arcaneFamiliarUptimeThresholds)
			.addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} /> was up for {formatPercentage(this.uptime)}% of the fight. If your Arcane Familiar dies, make sure you recast it. If you are having trouble keeping the Arcane Familiar up for the entire fight, consider taking a different talent.</>)
					.icon(SPELLS.ARCANE_FAMILIAR_TALENT.icon)
					.actual(<Trans id="mage.arcane.suggestions.arcaneFamiliar.uptime">{formatPercentage(this.uptime)}% Uptime</Trans>)
					.recommended(`${formatPercentage(recommended)}% is recommended`));
	}

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`Your Arcane Familiar was up for ${formatPercentage(this.uptime)}% of the fight. If your Arcane Familiar dies, make sure you recast it. If you are having trouble keeping the Arcane Familiar up for the entire fight, consider taking a different talent.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_FAMILIAR_TALENT}>
          <>
            {formatPercentage(this.uptime, 0)}% <small>Buff uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneFamiliar;
