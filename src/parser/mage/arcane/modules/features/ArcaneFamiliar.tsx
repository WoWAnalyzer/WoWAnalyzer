import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

class ArcaneFamiliar extends Analyzer {

	constructor(options: any) {
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
      style: 'percentage',
    };
  }

	suggestions(when: any) {
		when(this.arcaneFamiliarUptimeThresholds)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>Your <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} /> was up for {formatPercentage(this.uptime)}% of the fight. If your Arcane Familiar dies, make sure you recast it. If you are having trouble keeping the Arcane Familiar up for the entire fight, consider taking a different talent.</>)
					.icon(SPELLS.ARCANE_FAMILIAR_TALENT.icon)
					.actual(`${formatPercentage(this.uptime)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
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
