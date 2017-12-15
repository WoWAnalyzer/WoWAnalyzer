import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import ITEMS from "common/ITEMS/HUNTER";

const debug = false;

/*
 * Your ranged auto attacks have a 8% chance to trigger Lock and Load, causing your next two Aimed Shots to cost no Focus and be instant.
 */
class LockAndLoad extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  fullLNLProcs = 0;
  halfLNLProcs = 0;
  noGainLNLProcs = 0;
  totalProcs = 0;
  autoShots = 0;
  wastedInstants = 0;
  _currentStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.LOCK_AND_LOAD_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
  }
  //ch
  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    this.fullLNLProcs += 1;
    this.totalProcs += 1;
    this._currentStacks = 2;
    debug && console.log('full lnl proc, this is number ', this.fullLNLProcs);

  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id, event.timestamp)) {
      return;
    }
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    this._currentStacks -= 1;
  }
  on_byPlayer_refreshbuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    if (this._currentStacks === 1) {
      this.halfLNLProcs += 1;
      this.wastedInstants += 1;
      debug && console.log('at 1 stacks already proc, this is number ', this.halfLNLProcs);

    }
    if (this._currentStacks === 2) {
      this.noGainLNLProcs += 1;
      this.wastedInstants += 2;
      debug && console.log('at 2 stacks already proc, this is number ', this.noGainLNLProcs);
    }
    this.totalProcs += 1;
    this._currentStacks = 2;
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.AUTO_SHOT.id) {
      return;
    }
    this.autoShots += 1;
  }

  statistic() {
    const expectedProcs = this.autoShots * 0.08;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LOCK_AND_LOAD_TALENT.id} />}
        value={`${this.wastedInstants} (${formatPercentage(this.wastedInstants / (this.totalProcs * 2))}%)`}
        label={`lost instant casts`}
        tooltip={`You had ${formatPercentage(this.totalProcs / expectedProcs, 1)}% procs of what you could expect to get over the encounter. <br /> You had a total of ${this.totalProcs} procs, and your expected amount of procs was ${expectedProcs}. <br /> You had ${this.noGainLNLProcs} procs with 2 lnl stacks remaining and ${this.halfLNLProcs} while you had 1 stack remaining.`}
      />
    );
  }

}

export default LockAndLoad;
