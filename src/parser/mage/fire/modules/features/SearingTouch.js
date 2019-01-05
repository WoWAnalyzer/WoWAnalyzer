import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const debug = false;
const SEARING_TOUCH_HEALTH_THRESHOLD = .30;
const SEARING_TOUCH_DAMAGE_MODIFIER = 1.50;

class SearingTouch extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  badCasts = 0;
  totalCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL,SPELLS.SCORCH]), this.onDamage);
  }

  //When the target is under 30% health, check to see if the player cast Fireball. If they do, count it as a mistake.
  onDamage(event) {
    const healthPercent = event.hitPoints / event.maxHitPoints;
    if (healthPercent > SEARING_TOUCH_HEALTH_THRESHOLD) {
      return;
    }
    this.totalCasts += 1;
    if (event.ability.guid === SPELLS.FIREBALL.id) {
      this.badCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This Fireball was cast while the target was under ${formatPercentage(SEARING_TOUCH_HEALTH_THRESHOLD)}% health. While talented into Searing Touch, ensure that you are casting Scorch instead of Fireball while the target is under 30% health since Scorch does ${formatPercentage(SEARING_TOUCH_DAMAGE_MODIFIER)}% additional damage.`;
      debug && this.log("Cast Fireball under 30% Health");
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
				return suggest(<>You cast <SpellLink id={SPELLS.FIREBALL.id} /> instead of <SpellLink id={SPELLS.SCORCH.id} /> while the target was under 30% health {this.badCasts} times. When using <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> always use Scorch isntead of Fireball when the target is under 30% health since Scorch does 150% damage and is guaranteed to crit.</>)
					.icon(SPELLS.SEARING_TOUCH_TALENT.icon)
					.actual(`${formatPercentage(this.scorchUtil)}% Utilization`)
					.recommended(`${formatPercentage(recommended)} is recommended`);
			});
  }

}

export default SearingTouch;
