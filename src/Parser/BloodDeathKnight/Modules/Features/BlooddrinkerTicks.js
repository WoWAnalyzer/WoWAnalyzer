import React from 'react';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellIcon from 'common/SpellIcon';

class BlooddrinkerTicks  extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  _totalTicks = 0;
  _totalCasts=0;
  _currentTicks = 0;
  _wastedTicks = 0;
  _ruinedCasts = 0;
  BLOODDRINKER_TICKS_PER_CAST = 4 ;

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.BLOODDRINKER.id) {
      this._totalCasts++;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.BLOODDRINKER.id) {
      this._currentTicks++;
    }
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid === SPELLS.BLOODDRINKER.id) {
      if (this._currentTicks < this.BLOODDRINKER_TICKS_PER_CAST) {
        this._wastedTicks += (this.BLOODDRINKER_TICKS_PER_CAST - this._currentTicks);
        this._ruinedCasts++;
      }
      this._currentTicks = 0;
    }
  }


  statistic() {
    this._totalTicks = this._totalCasts * this.BLOODDRINKER_TICKS_PER_CAST;
    return (

      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLOODDRINKER.id} />}
        value={this._ruinedCasts}
        label='Blooddrinker Cancelled Early'
        tooltip={`You lost <strong>${this._wastedTicks}</strong> out of <strong>${this._totalTicks}</strong> ticks.`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BlooddrinkerTicks;
