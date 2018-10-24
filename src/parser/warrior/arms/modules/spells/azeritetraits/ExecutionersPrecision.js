import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SpellUsable from '../../features/SpellUsable';

/**
 * Execute increases the damage of your next Mortal Strike against the target by 439, stacking up to 2 times.
 */

class ExecutionersPrecisionAnalyzer extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EXECUTIONERS_PRECISION_TRAIT.id);
  }

  procs = 0;
  wastedProcs = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.EXECUTE.id) {
      return;
    }

    this.procs += 1;
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }

    const executionersPrecision = enemy.getBuff(SPELLS.EXECUTIONERS_PRECISION_DEBUFF.id);
    if (executionersPrecision !== undefined && executionersPrecision.stacks === 2 && this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id)) {
      this.wastedProcs += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Execute was used on a target with 2 stacks of Executioner\'s Precision while Mortal Strike was available.';
    }
  }

  get wastedExecutionersPrecisionTresholds() {
    return {
      actual: this.wastedProcs / this.procs,
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
      return suggest(<>Try to avoid using <SpellLink id={SPELLS.EXECUTE.id} icon /> at 2 stacks of <SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} icon /> if <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> is available. Use your stacks of Executioner's Precision with Mortal Strike to avoid over stacking, which result in a loss of damage.</>)
        .icon(SPELLS.EXECUTE.icon)
        .actual(`${formatPercentage(actual)}% of Executioner's Precisions stacks were wasted.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default ExecutionersPrecisionAnalyzer;
