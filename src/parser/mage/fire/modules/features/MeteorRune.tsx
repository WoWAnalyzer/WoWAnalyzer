import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import { RUNE_OF_POWER_DELAY } from '../../constants';

class MeteorRune extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: EnemyInstances,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: EnemyInstances;

  hasMeteor: boolean;
  hasRuneOfPower: boolean;

  lastRuneCast = 0
  badMeteor = 0

  constructor(options: any) {
    super(options);
    this.hasMeteor = this.selectedCombatant.hasTalent(SPELLS.METEOR_TALENT.id);
    this.hasRuneOfPower = this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
    this.active = this.hasMeteor && this.hasRuneOfPower ? true : false;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.METEOR_TALENT), this.onMeteor);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RUNE_OF_POWER_TALENT), this.onRune);
  }

  onRune(event: CastEvent) {
    this.lastRuneCast = event.timestamp;
  }

  onMeteor(event: CastEvent) {
    console.log(event.timestamp - this.lastRuneCast);
    if (!this.selectedCombatant.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id) && event.timestamp - this.lastRuneCast > RUNE_OF_POWER_DELAY) {
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

  suggestions(when: any) {
		when(this.meteorUtilSuggestionThresholds)
			.addSuggestion((suggest: any, actual: any, recommended: any) => {
				return suggest(<>You cast <SpellLink id={SPELLS.METEOR_TALENT.id} /> without <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> {this.badMeteor} times. In order to get the most out of <SpellLink id={SPELLS.METEOR_TALENT.id} /> you should always cast it while being buffed by <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />.</>)
					.icon(SPELLS.METEOR_TALENT.icon)
					.actual(`${formatPercentage(this.meteorUtilization)}% Utilization`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default MeteorRune;
