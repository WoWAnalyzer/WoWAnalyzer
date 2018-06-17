import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import StatisticBox from 'Main/StatisticBox';

const debug = false;

const BUFF_DURATION = 10000;
// haven't yet found out if it's exactly 10 second delay between application and removal of the buff (or is it few ms earlier), might need to tweak with that to be accurate
const REMOVEBUFF_TOLERANCE = 20;

class Backdraft extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _maxStacks = 2;
  _stacksPerApplication = 1;
  _currentStacks = 0;
  _expectedBuffEnd = 0;
  wastedStacks = 0;

  on_initialized() {
    this._maxStacks = this.combatants.selected.hasTalent(SPELLS.FLASHOVER_TALENT.id) ? 4 : 2;
    this._stacksPerApplication = this.combatants.selected.hasTalent(SPELLS.FLASHOVER_TALENT.id) ? 2 : 1;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.CONFLAGRATE.id) {
      return;
    }
    this._currentStacks += this._stacksPerApplication;
    if (this._currentStacks > this._maxStacks) {
      debug && console.log('backdraft stack waste at ', event.timestamp);
      this.wastedStacks += this._currentStacks - this._maxStacks;
      this._currentStacks = this._maxStacks;
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.BACKDRAFT.id) {
      return;
    }
    this._currentStacks -= 1;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.BACKDRAFT.id) {
      return;
    }
    if (event.timestamp >= this._expectedBuffEnd - REMOVEBUFF_TOLERANCE) {
      // if the buff expired when it "should", we wasted some stacks
      debug && console.log('backdraft stack waste at ', event.timestamp);
      this.wastedStacks += this._currentStacks;
    }
    this._currentStacks = 0;
  }

  get suggestionThresholds() {
    const wastedStacksPerMinute = this.wastedStacks / this.owner.fightDuration * 1000 * 60;
    return {
      actual: wastedStacksPerMinute,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You should use your <SpellLink id={SPELLS.BACKDRAFT_TALENT.id} /> stacks more. You have wasted {this.wastedStacks} stacks this fight.</React.Fragment>)
          .icon(SPELLS.BACKDRAFT_TALENT.icon)
          .actual(`${actual.toFixed(2)} wasted Backdraft stacks per minute`)
          .recommended(`< ${recommended} is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BACKDRAFT.id} />}
        value={this.wastedStacks}
        label="Wasted Backdraft procs"
      />
    );
  }
}

export default Backdraft;
