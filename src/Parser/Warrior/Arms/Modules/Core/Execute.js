import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SpellUsable from '../Features/SpellUsable';

class ExecutionAnalyzer extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  executes = 0;
  wastedExecutionersPrecisions = 0;

  on_byPlayer_cast(event) {
    if (SPELLS.EXECUTE.id !== event.ability.guid) {
      return;
    }

    this.executes += 1;
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const executionersPrecision = enemy.getBuff(SPELLS.EXECUTIONERS_PRECISION.id);
    if (executionersPrecision !== undefined && executionersPrecision.stacks === 2 && this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id)) {
      this.wastedExecutionersPrecisions += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Execute was used on a target with 2 stacks of Executioner\'s Precision while Mortal Strike was available.';
    }
  }

  get wastedExecutionersPrecisionTresholds() {
    return {
      actual: this.wastedExecutionersPrecisions / this.executes,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.wastedExecutionersPrecisionTresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to avoid using <SpellLink id={SPELLS.EXECUTE.id} icon /> at 2 stacks of <SpellLink id={SPELLS.EXECUTIONERS_PRECISION.id} icon /> if <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> is available.</React.Fragment>)
        .icon(SPELLS.EXECUTE.icon)
        .actual(`${formatPercentage(actual)}% of Executioner's Precisions stacks were wasted.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default ExecutionAnalyzer;
