import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { ApplyDebuffEvent, ApplyDebuffStackEvent, CastEvent, EventType, RemoveDebuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.onAimedShot);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STEADY_SHOT), this.onSteadyShot);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.STEADY_AIM_DEBUFF), (event: ApplyDebuffEvent) => this.onDebuffChange(event));
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.STEADY_AIM_DEBUFF), (event: ApplyDebuffStackEvent) => this.onDebuffChange(event));
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.STEADY_AIM_DEBUFF), (event: RemoveDebuffEvent) => this.onDebuffChange(event));
  }

  applications = 0;
  _stacks = 0;
  aimedShotStacks = 0;
  aimedShots = 0;
  maxPossible = 0;
  wasted = 0;
  utilised = 0;
  removeDebuffTimestamp: number = 0;

  onAimedShot(event: CastEvent) {
    this.aimedShots += 1;
    if (this.aimedShotStacks > 0 && event.timestamp + MS_BUFFER > this.removeDebuffTimestamp) {
      this.utilised += this.aimedShotStacks;
      this.aimedShotStacks = 0;
    }
  }

  onSteadyShot() {
    this.maxPossible += 1;
    if (this._stacks === MAX_STACKS) {
      this.wasted += 1;
    }
  }

  onDebuffChange(event: ApplyDebuffEvent | ApplyDebuffStackEvent | RemoveDebuffEvent) {
    if (event.type === EventType.RemoveDebuff) {
      this.removeDebuffTimestamp = event.timestamp;
      this.aimedShotStacks = this._stacks;
    } else {
      this.applications += 1;
    }
    this._stacks = currentStacks(event);
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
