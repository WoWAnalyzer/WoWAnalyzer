import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';

/**
 * Steady Shot increases the damage of your next Aimed Shot against the target by X, stacking up to 5 times.
 *
 * Example: https://www.warcraftlogs.com/reports/2vJyCmRVKgQWLHcY/#fight=9&source=3
 */

const MAX_STACKS = 5;
const MS_BUFFER = 100;

class SteadyAim extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.STEADY_AIM.id);
  }

  applications = 0;
  _stacks = 0;
  aimedShotStacks = 0;
  aimedShots = 0;
  maxPossible = 0;
  wasted = 0;
  utilised = 0;
  removeDebuffTimestamp = null;

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_AIM_DEBUFF.id) {
      return;
    }
    this.applications += 1;
    this._stacks = 1;
  }

  on_byPlayer_applydebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_AIM_DEBUFF.id) {
      return;
    }
    this.applications += 1;
    this._stacks = event.stack;
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_AIM_DEBUFF.id) {
      return;
    }
    this.removeDebuffTimestamp = event.timestamp;
    this.aimedShotStacks = this._stacks;
    this._stacks = 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_SHOT.id && spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.STEADY_SHOT.id) {
      this.maxPossible++;
      if (this._stacks === MAX_STACKS) {
        this.wasted += 1;
      }
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      this.aimedShots += 1;
      if (this.aimedShotStacks > 0 && event.timestamp + MS_BUFFER > this.removeDebuffTimestamp) {
        this.utilised += this.aimedShotStacks;
        this.aimedShotStacks = 0;
      }
    }
  }

  get averageStacksPerAimed() {
    return (this.utilised / this.aimedShots).toFixed(2);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.STEADY_AIM.id}
        value={`${this.averageStacksPerAimed} Stacks / Aimed`}
        tooltip={`${this.utilised} debuffs applied / ${this.maxPossible} possible`} />
    );
  }
}

export default SteadyAim;
