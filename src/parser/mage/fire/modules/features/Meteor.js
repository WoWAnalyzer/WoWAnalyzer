import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';

class Meteor extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: EnemyInstances,
  };

  badMeteor = 0

  constructor(...args) {
    super(...args);
    this.hasMeteor = this.selectedCombatant.hasTalent(SPELLS.METEOR_TALENT.id);
    this.hasRuneOfPower = this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
    this.active = this.hasMeteor && this.hasRuneOfPower ? true : false;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.METEOR_TALENT), this.onMeteor);
  }

  onMeteor(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id)) {
      this.badMeteor += 1;
    }
  }

  get totalMeteorCasts() {
    return this.abilityTracker.getAbility(SPELLS.METEOR_TALENT.id).casts;
  }

  get meteorUtilization() {
    return 1 - (this.badMeteor / this.totalMeteorCasts);
  }

  get meteorUtilSuggestionThresholds() {
    return {
      actual: this.meteorUtilization,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
		when(this.meteorUtilSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<>You cast <SpellLink id={SPELLS.METEOR_TALENT.id} /> without <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> {this.badMeteor} times. In order to get the most out of <SpellLink id={SPELLS.METEOR_TALENT.id} /> you should always cast it while being buffed by <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />.</>)
					.icon(SPELLS.METEOR_TALENT.icon)
					.actual(`${formatPercentage(this.meteorUtilization)}% Utilization`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
	}

	statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(100)}
        icon={<SpellIcon id={SPELLS.METEOR_TALENT.id} />}
        value={`${formatPercentage(this.meteorUtilization, 0)} %`}
        label="Meteor Utilization"
        tooltip={(
          <>
            This is a measure of how well you utilized your Meteor casts.
            <ul>
              <li>{this.totalMeteorCasts} Total Meteor casts</li>
              <li>{this.totalMeteorCasts - this.badMeteor} Meteor casts during Rune of Power</li>
              <li>{this.badMeteor} Meteor casts without Rune of Power</li>
            </ul>
          </>
        )}
      />
    );
  }
}

export default Meteor;
