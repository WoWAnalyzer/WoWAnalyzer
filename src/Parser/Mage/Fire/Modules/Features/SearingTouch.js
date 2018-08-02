import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const debug = false;

class SearingTouch extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  badCasts = 0;
  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FIREBALL.id || spellId === SPELLS.SCORCH.id) {
      const healthPercent = event.hitPoints / event.maxHitPoints;

      if (healthPercent < .30) {
        this.totalCasts += 1;
      }
      if (spellId === SPELLS.FIREBALL.id && healthPercent < .30) {
        this.badCasts += 1;
        debug && console.log("Cast Fireball under 30% Health @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
    }
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
				return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.FIREBALL.id} />  instead of <SpellLink id={SPELLS.SCORCH.id} /> while the target was under 30% health {this.badCasts} times. When using <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> always use Scorch isntead of Fireball when the target is under 30% health since Scorch does 150% damage and is guaranteed to crit.</React.Fragment>)
					.icon(SPELLS.SEARING_TOUCH_TALENT.icon)
					.actual(`${formatPercentage(this.scorchUtil)}% Utilization`)
					.recommended(`${formatPercentage(recommended)} is recommended`);
			});
  }

}

export default SearingTouch;
