import React from 'react';
import Events from 'parser/core/Events';
import ExecuteRange from 'parser/warrior/arms/modules/core/Execute/ExecuteRange';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from '../../features/SpellUsable';

/**
 * Execute increases the damage of your next Mortal Strike against the target by 439, stacking up to 2 times.
 *
 * Mortal Strike should be used during the execute phase with this trait while the player have 2 stacks of Executioner's Precision and 2 stacks of Overpower.
 */

class ExecutionersPrecisionAnalyzer extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
    executeRange: ExecuteRange,
  };

  mortalStrikeOnExecPhase = 0;
  badMortalStrikeOnExecPhase = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EXECUTIONERS_PRECISION_TRAIT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MORTAL_STRIKE), this._badMortalStrikeCastOnExecPhase);
  }

  _badMortalStrikeCastOnExecPhase(event) {
    if (!this.executeRange.isTargetInExecuteRange(event)) {
      return;
    }

    this.mortalStrikeOnExecPhase += 1;

    const enemy = this.enemies.getEntity(event);
    const ep = enemy.getBuff(SPELLS.EXECUTIONERS_PRECISION_DEBUFF.id);
    const op = this.selectedCombatant.getBuff(SPELLS.OVERPOWER.id);
    if ((ep === undefined || op === undefined) || (!ep && !op && !enemy)) {
      return;
    }

    if (ep.stacks !== 2 || op.stacks !== 2) {
      this.badMortalStrikeOnExecPhase += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Mortal Strike was used on a target without 2 stacks of Executioner\'s Precision and 2 stacks of Overpower.';
    }
  }

  get badMortalStrikeCastThresholds() {
    return {
      actual: this.badMortalStrikeOnExecPhase / this.mortalStrikeOnExecPhase || 0,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.badMortalStrikeCastThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Try to avoid using <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> during the <SpellLink id={SPELLS.EXECUTE.id} /> phase when you don't have 2 stacks of <SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} /> and 2 stacks of <SpellLink id={SPELLS.OVERPOWER.id} />.</>)
        .icon(SPELLS.MORTAL_STRIKE.icon)
        .actual(`${formatPercentage(actual)}% of your Mortal Strike were used while you didn't have 2 stacks of Executioner's Precision and Overpower.`)
        .recommended(`${recommended}% is recommended`);
    });
  }
}

export default ExecutionersPrecisionAnalyzer;
