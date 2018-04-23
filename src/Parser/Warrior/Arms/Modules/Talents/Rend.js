import React from 'react';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import ExecuteRange from '../Features/ExecuteRange';

class RendAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    executeRange: ExecuteRange,
  };

  rends = 0;
  rendsInExecuteRange = 0;

  on_initialized() {
		this.active = this.combatants.selected.hasTalent(SPELLS.REND_TALENT.id);
	}

  on_byPlayer_cast(event) {
    if(SPELLS.REND_TALENT.id !== event.ability.guid) {
      return;
    }

    this.rends += 1;
    if(this.executeRange.isTargetInExecuteRange(event)) {
      this.rendsInExecuteRange += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Rend was used on a target in Execute range.';
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
        return suggest(<React.Fragment>Try to avoid using <SpellLink id={SPELLS.REND_TALENT.id} icon/> on a target in <SpellLink id={SPELLS.EXECUTE.id} icon/> range.</React.Fragment>)
          .icon(SPELLS.REND_TALENT.icon)
          .actual(`Rend was used ${formatPercentage(actual)}% of the time on a target in execute range.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default RendAnalyzer;
