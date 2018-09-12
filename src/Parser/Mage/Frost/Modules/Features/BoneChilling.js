import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

class BoneChilling extends Analyzer {

  constructor(...args) {
    super(...args);
	   this.active = this.selectedCombatant.hasTalent(SPELLS.BONE_CHILLING_TALENT.id);
  }

  get uptime() {
		return this.selectedCombatant.getBuffUptime(SPELLS.BONE_CHILLING_BUFF.id) / this.owner.fightDuration;
	}

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>Your <SpellLink id={SPELLS.BONE_CHILLING_BUFF.id} /> was up for {formatPercentage(this.uptime)}% of the fight. Bone Chilling is a stacking buff that increases your damage by up to 5%, so it is important that you have the buff up for as much of the fight as possible. If you are unable to maintain this buff, then consider taking a different talent.</React.Fragment>)
					.icon(SPELLS.BONE_CHILLING_TALENT.icon)
					.actual(`${formatPercentage(this.uptime)}% Uptime`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
  position={STATISTIC_ORDER.CORE(100)}
  icon={<SpellIcon id={SPELLS.BONE_CHILLING_TALENT.id} />}
  value={`${formatPercentage(this.uptime, 0)} %`}
  label="Bone Chilling Uptime"
  tooltip={`Bone Chilling was up for ${formatPercentage(this.uptime)}% of the fight. Bone Chilling is a stacking buff that increases your damage by up to 5%, so it is important that you have the buff up for as much of the fight as possible. If you are unable to maintain this buff, then consider taking a different talent.`}
			/>
		);
	}
}

export default BoneChilling;
