import React from 'react';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';

import ExecuteRange from './ExecuteRange';

class MortalStrikeAnalyzer extends Analyzer {
  static dependencies = {
    executeRange: ExecuteRange,
  };

  mortalStrikes = 0;
  mortalStrikesInExecuteRange = 0;

  constructor(...args) {
    super(...args);
		this.active = !this.selectedCombatant.hasTrait(SPELLS.EXECUTIONERS_PRECISION_TRAIT.id);
	}

  on_byPlayer_cast(event) {
    if(SPELLS.MORTAL_STRIKE.id !== event.ability.guid) {
      return;
    }

    this.mortalStrikes += 1;
    if(this.executeRange.isTargetInExecuteRange(event)) {
      this.mortalStrikesInExecuteRange += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Mortal Strike was used on a target in Execute range.';
    }
  }

  get executeMortalStrikeThresholds() {
    return {
        actual: this.mortalStrikesInExecuteRange / this.mortalStrikes,
        isGreaterThan: {
            minor: 0,
            average:0.05,
            major: 0.1,
        },
        style: 'percent',
    };
  }

  suggestions(when) {
    when(this.executeMortalStrikeThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Try to avoid using <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> on a target in <SpellLink id={SPELLS.EXECUTE.id} icon /> range if you don't have <SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} /> trait.</>)
          .icon(SPELLS.MORTAL_STRIKE.icon)
          .actual(`Mortal strike was used ${formatPercentage(actual)}% of the time on a target in execute range.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default MortalStrikeAnalyzer;
