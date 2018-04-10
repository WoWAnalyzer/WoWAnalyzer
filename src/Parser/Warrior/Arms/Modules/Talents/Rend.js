import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import Analyzer from 'Parser/Core/Analyzer';

const EXECUTE_RANGE = 0.2;

class RendAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  rendsInExecuteRange = 0;
  targets = [];
  failedTargets = [];

  on_initialized() {
		this.active = this.combatants.selected.hasTalent(SPELLS.REND_TALENT.id);
	}

  on_byPlayer_cast(event) {
    if(SPELLS.REND_TALENT.id === event.ability.guid) {
      // If Rend is used flag the target to check their health on the next damage event.
      this.targets.push(event.targetID);
    }
  }

  on_byPlayer_damage(event) {
    const targetId = event.targetID;

    if(SPELLS.REND_TALENT.id === event.ability.guid && this.targets.indexOf(targetId) !== -1) {
      // Check if the target's health was within execute range.
      if(event.hitPoints / event.maxHitPoints < EXECUTE_RANGE) {
        if(this.failedTargets.indexOf(targetId) === -1) {
          // If this is the first time Rend was used on this target in execute range we flag that target.
          // This is to prevent false positives from Rend being applied just as the target enters execute range.
          this.failedTargets.push(targetId);
        } else {
          // Increment the counter
          this.rendsInExecuteRange += 1;
        }
      }

      // Unflag the target for checking.
      this.targets.splice(this.targets.indexOf(targetId), 1);
    }
  }

  get executeRendsThresholds() {
    return {
			actual: this.rendsInExecuteRange,
			isGreaterThan: {minor: 0, average:1, major: 2},
			style: 'number',
		};
  }

  suggestions(when) {
    when(this.executeRendsThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should avoid using <SpellLink id={SPELLS.REND_TALENT.id} icon/> on a target in <SpellLink id={SPELLS.EXECUTE.id} icon/> range.</Wrapper>)
          .icon(SPELLS.REND_TALENT.icon)
          .actual(`Rend was used ${actual} times on a target in execute range`)
          .recommended('0 is recommended.');
      });
  }
}

export default RendAnalyzer;
