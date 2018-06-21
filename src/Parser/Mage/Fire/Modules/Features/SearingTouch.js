import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const debug = false;

class SearingTouch extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  badCasts = 0;
  totalCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FIREBALL.id || spellId === SPELLS.SCORCH.id) {
      this.currentHealth = event.hitPoints;
      this.maxHealth = event.maxHitPoints;
    }
    if (this.healthPercent < .30) {
      this.totalCasts += 1;
    }
    if (spellId === SPELLS.FIREBALL.id && this.healthPercent < .15) {
      this.badCasts += 1;
      debug && console.log("Cast Fireball under 30% Health @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  get healthPercent() {
    return this.currentHealth / this.maxHealth;
  }

  get scorchUtil() {
    return 1 - (this.badCasts / this.totalCasts);
  }

  get suggestionThreshold() {
    return {
      actual: this.scorchUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
		when(this.suggestionThreshold)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.FIREBALL.id} />  instead of <SpellLink id={SPELLS.SCORCH.id} /> while the target was under 30% health {this.badCasts} times. When using <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> you should always make sure you are using Scorch instead of Fireball when the target is under 30% health since Scorch does 150% damage and is guaranteed to crit.</React.Fragment>)
					.icon(SPELLS.SEARING_TOUCH_TALENT.icon)
					.actual(`${formatPercentage(this.scorchUtil)}% Utilization`)
					.recommended(`${formatPercentage(recommended)} is recommended`);
			});
  }

}

export default SearingTouch;
