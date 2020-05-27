import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { ApplyDebuffEvent, ApplyDebuffStackEvent, CastEvent, RemoveDebuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

/**
 * Steady Shot increases the damage of your next Aimed Shot against the target by X, stacking up to 5 times.
 *
 * Example:
 * https://www.warcraftlogs.com/reports/wPdQLfFnhTVYRyJm#fight=12&type=damage-done&source=640
 */

const MAX_STACKS = 5;
const MS_BUFFER = 100;

class SteadyAim extends Analyzer {

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.STEADY_AIM.id);
  }

  applications = 0;
  _stacks = 0;
  aimedShotStacks = 0;
  aimedShots = 0;
  maxPossible = 0;
  wasted = 0;
  utilised = 0;
  removeDebuffTimestamp: number = 0;

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_AIM_DEBUFF.id) {
      return;
    }
    this.applications += 1;
    this._stacks = 1;
  }

  on_byPlayer_applydebuffstack(event: ApplyDebuffStackEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_AIM_DEBUFF.id) {
      return;
    }
    this.applications += 1;
    this._stacks = event.stack;
  }

  on_byPlayer_removedebuff(event: RemoveDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_AIM_DEBUFF.id) {
      return;
    }
    this.removeDebuffTimestamp = event.timestamp;
    this.aimedShotStacks = this._stacks;
    this._stacks = 0;
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEADY_SHOT.id && spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.STEADY_SHOT.id) {
      this.maxPossible += 1;
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
    return this.utilised / this.aimedShots;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
      >
        <BoringSpellValueText spell={SPELLS.STEADY_AIM}>
          <>
            {this.utilised} / {this.maxPossible} <small>possible</small> <br />
            {this.averageStacksPerAimed.toFixed(1)} <small>average stacks</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SteadyAim;
