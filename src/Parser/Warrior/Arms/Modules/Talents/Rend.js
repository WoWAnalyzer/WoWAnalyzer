import React from 'react';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

const EXECUTE_RANGE = 0.2;

class RendAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  rends = 0;
  rendsInExecuteRange = 0;
  targets = [];
  failedTargets = [];

  on_initialized() {
		this.active = this.combatants.selected.hasTalent(SPELLS.REND_TALENT.id);
	}

  on_byPlayer_cast(event) {
    if(SPELLS.REND_TALENT.id === event.ability.guid) {
      // If Rend is used flag the target to check their health on the next damage event.
      this.targets.push(encodeTargetString(event.targetID, event.targetInstance));

      this.rends += 1;
    }
  }

  on_byPlayer_damage(event) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    if(SPELLS.REND_TALENT.id === event.ability.guid && this.targets.indexOf(targetString) !== -1) {
      // Unflag the target for checking.
      this.targets.splice(this.targets.indexOf(targetString), 1);

      // Check if the target's health was within execute range.
      if(event.hitPoints / event.maxHitPoints >= EXECUTE_RANGE) {
        return;
      }

      if(this.failedTargets.indexOf(targetString) === -1) {
        // If this is the first time Rend was used on this target in execute range we flag that target.
        // This is to prevent false positives from Rend being applied just as the target enters execute range.
        this.failedTargets.push(targetString);
      } else {
        // Increment the counter
        this.rendsInExecuteRange += 1;
      }
    }
  }

  get executeRendsThresholds() {
    return {
			actual: this.rendsInExecuteRange / this.rends,
			isGreaterThan: {
        minor: 0,
        average:0.05,
        major: 0.1,
      },
			style: 'percent',
		};
  }

  suggestions(when) {
    when(this.executeRendsThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should avoid using <SpellLink id={SPELLS.REND_TALENT.id} icon/> on a target in <SpellLink id={SPELLS.EXECUTE.id} icon/> range.</Wrapper>)
          .icon(SPELLS.REND_TALENT.icon)
          .actual(`Rend was used ${formatPercentage(actual)}% of the time on a target in execute range.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default RendAnalyzer;
