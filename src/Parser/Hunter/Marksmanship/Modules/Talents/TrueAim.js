import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';

const MAX_STACKS = 10;

class TrueAim extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _currentStacks = 0;
  startOfMaxStacks = 0;
  timeAtMaxStacks = 0;

  //starts -1 because the stacks drop at end of combat, but that shouldn't count as a time where it dropped
  timesDropped = -1;
  totalTimesDropped = -1;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TRUE_AIM_TALENT.id);
  }

  on_byPlayer_applydebuffstack(event) {
    const debuffId = event.ability.guid;
    if (debuffId !== SPELLS.TRUE_AIM_DEBUFF.id) {
      return;
    }
    //I can't use on_byPlayer_applydebuff as it won't work in conjunction with on_byplayer_removedebuff
    //so we do it this way, and just make a check if _currentStacks is 0, in which case we set it to 1 to indicate it already has been applied.
    if (this._currentStacks === 0) {
      this._currentStacks = 1;
    }
    this._currentStacks += 1;
    if (this._currentStacks === MAX_STACKS) {
      this.startOfMaxStacks = event.timestamp;
    }
  }
  on_byPlayer_removedebuff(event) {
    const debuffId = event.ability.guid;
    if (debuffId !== SPELLS.TRUE_AIM_DEBUFF.id) {
      return;
    }
    if (this._currentStacks === MAX_STACKS) {
      this.timeAtMaxStacks += event.timestamp - this.startOfMaxStacks;
    }
    //ensures Trickshot cleaving doesn't count as multiple resets of stacks
    if (this._currentStacks >= 3) {
      this.timesDropped += 1;
    }
    this.totalTimesDropped += 1;
    this._currentStacks = 0;
  }

  statistic() {
    const percentTimeAtMaxTAStacks = formatPercentage(this.timeAtMaxStacks / this.owner.fightDuration);
    //only shows if timesDropped is greater than 0, to only show it on encounters where it might matter - we expect full uptime on any ST boss.
      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.TRUE_AIM_DEBUFF.id} />}
          value={`${percentTimeAtMaxTAStacks} %`}
          label="10 stack uptime"
          tooltip={`You reset True Aim when you had 3 or more stacks (to exclude trickshot cleaving resets): ${this.timesDropped} times over the course of the encounter. <br />Your total amount of resets (including with trickshot cleaving) was: ${this.totalTimesDropped}.`}
        />
      );
  }

}

export default TrueAim;
