import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import ITEMS from "common/ITEMS/HUNTER";

const debug = false;

class LockAndLoad extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  fullLNLProcs = 0;
  halfLNLProcs = 0;
  noGainLNLProcs = 0;
  totalProcs = 0;
  autoshots = 0;
  wastedInstants = 0;

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
    debug && console.log('full lnl proc, this is number ', this.fullLNLProcs);

  }

  //haven't found a log where this happens yet, but this should theoretically work.
  on_byPlayer_applybuffstack(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    this.halfLNLProcs += 1;
    this.totalProcs += 1;
    this.wastedInstants += 1;
    debug && console.log('at 1 stack proc, this is number ', this.halfLNLProcs);

  }
  on_byPlayer_refreshbuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.LOCK_AND_LOAD_BUFF.id) {
      return;
    }
    this.noGainLNLProcs += 1;
    this.totalProcs += 1;
    this.wastedInstants += 2;
    debug && console.log('at 2 stacks already proc, this is number ', this.noGainLNLProcs);

  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.AUTO_SHOT.id) {
      return;
    }
    this.autoshots += 1;
  }

  statistic() {
    const expectedProcs = Math.round(this.autoshots * 0.08);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LOCK_AND_LOAD_TALENT.id} />}
        value={`${formatPercentage(this.totalProcs / expectedProcs, 1)}%`}
        label={`of expected procs`}
        tooltip={`You had a total of ${this.totalProcs} procs, and your expected amount of procs was ${expectedProcs}. <br /> You had ${this.noGainLNLProcs} with 2 lnl stacks remaining and ${this.halfLNLProcs} while you had 1 stack remaining. This resulted in you losing out on ${this.wastedInstants} instant casts of Aimed Shot due to overlapping.`}
      />
    );
  }

}

export default LockAndLoad;
