import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';

class TrueAim extends Module {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  _currentStacks = 0;
  startOfMaxStacks = 0;
  timeAtMaxStacks = 0;

  //starts -1 because the stacks drop at end of combat, but that shouldn't count as a time where it dropped
  timesDropped = -1;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TRUE_AIM_TALENT.id);
  }

  on_byPlayer_applydebuffstack(event) {
    const debuffId = event.ability.guid;
    if (debuffId !== SPELLS.TRUE_AIM_DEBUFF.id) {
      return;
    }
    //I can't use on_byPlayer_applydebuff as it won't work in conjunction with on_byplayer_applydebuffstack
    //so we do it this way, and just make a check if _currentStacks is 0, in which case we set it to 1 to indicate it already has been applied.
    if (this._currentStacks === 0) {
      this._currentStacks = 1;
    }
    this._currentStacks += 1;
    if (this._currentStacks === 10) {
      this.startOfMaxStacks = event.timestamp;
    }
  }
  on_byPlayer_removedebuff(event) {
    const debuffId = event.ability.guid;
    if (debuffId !== SPELLS.TRUE_AIM_DEBUFF.id) {
      return;
    }
    if (this._currentStacks === 10) {
      this.timeAtMaxStacks += event.timestamp - this.startOfMaxStacks;
    }
    //ensures Trickshot cleaving doesn't count as multiple resets of stacks
    if (this._currentStacks > 2) {
      this.timesDropped += 1;
    }
    this._currentStacks = 0;
  }

  statistic() {
    const percentTimeAtMaxTAStacks = formatPercentage(this.timeAtMaxStacks / this.owner.fightDuration);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRUE_AIM_DEBUFF.id} />}
        value={`${percentTimeAtMaxTAStacks} %`}
        label="10 stack uptime"
        tooltip={`You reset your stacks ${this.timesDropped} times over the course of the encounter`}
      />
    );
  }

}

export default TrueAim;
